package aria2

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"matrix-panel/lib/integration"
)

type Aria2Integration struct {
	*integration.BaseIntegration
}

func New(id, name, url string, secrets map[string]string) *Aria2Integration {
	return &Aria2Integration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindAria2), url, secrets),
	}
}

// JSON-RPC Request Structure
type jsonRPCRequest struct {
	JSONRPC string        `json:"jsonrpc"`
	Method  string        `json:"method"`
	ID      string        `json:"id"`
	Params  []interface{} `json:"params"`
}

// JSON-RPC Response Structure
type jsonRPCResponse struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      string          `json:"id"`
	Result  json.RawMessage `json:"result"`
	Error   *jsonRPCError   `json:"error"`
}

type jsonRPCError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// Aria2 Task Structure
type aria2Task struct {
	GID             string `json:"gid"`
	Status          string `json:"status"` // active, waiting, paused, error, complete, removed
	TotalLength     string `json:"totalLength"`
	CompletedLength string `json:"completedLength"`
	UploadLength    string `json:"uploadLength"`
	DownloadSpeed   string `json:"downloadSpeed"`
	UploadSpeed     string `json:"uploadSpeed"`
	InfoHash        string `json:"infoHash"`
	Dir             string `json:"dir"`
	Files           []struct {
		Path string `json:"path"`
	} `json:"files"`
	Bittorrent struct {
		Info struct {
			Name string `json:"name"`
		} `json:"info"`
	} `json:"bittorrent"`
}

// Aria2 Global Stat Structure
type aria2GlobalStat struct {
	DownloadSpeed   string `json:"downloadSpeed"`
	UploadSpeed     string `json:"uploadSpeed"`
	NumActive       string `json:"numActive"`
	NumWaiting      string `json:"numWaiting"`
	NumStopped      string `json:"numStopped"`
	NumStoppedTotal string `json:"numStoppedTotal"`
}

func (a *Aria2Integration) TestConnection(ctx context.Context) error {
	// Call aria2.getVersion
	_, err := a.call(ctx, "aria2.getVersion", nil)
	return err
}

func (a *Aria2Integration) GetTorrents(ctx context.Context) ([]integration.TorrentItem, error) {
	var torrents []integration.TorrentItem

	// Keys to retrieve
	keys := []string{
		"gid", "status", "totalLength", "completedLength", "uploadLength",
		"downloadSpeed", "uploadSpeed", "infoHash", "dir", "bittorrent",
	}

	// 1. tellActive
	active, err := a.getTasks(ctx, "aria2.tellActive", keys)
	if err != nil {
		return nil, err
	}
	torrents = append(torrents, active...)

	// 2. tellWaiting (offset 0, num 1000)
	waiting, err := a.getTasks(ctx, "aria2.tellWaiting", 0, 1000, keys)
	if err != nil {
		return nil, err
	}
	torrents = append(torrents, waiting...)

	// 3. tellStopped (offset 0, num 1000)
	stopped, err := a.getTasks(ctx, "aria2.tellStopped", 0, 1000, keys)
	if err != nil {
		return nil, err
	}
	torrents = append(torrents, stopped...)

	return torrents, nil
}

func (a *Aria2Integration) GetStatus(ctx context.Context) (*integration.ClientStatus, error) {
	var stat aria2GlobalStat
	err := a.callAndBind(ctx, "aria2.getGlobalStat", nil, &stat)
	if err != nil {
		return nil, err
	}

	downSpeed, _ := strconv.ParseInt(stat.DownloadSpeed, 10, 64)
	upSpeed, _ := strconv.ParseInt(stat.UploadSpeed, 10, 64)
	active, _ := strconv.Atoi(stat.NumActive)
	waiting, _ := strconv.Atoi(stat.NumWaiting)
	stopped, _ := strconv.Atoi(stat.NumStopped)

	return &integration.ClientStatus{
		TotalDownloadSpeed: downSpeed,
		TotalUploadSpeed:   upSpeed,
		ActiveDownloads:    active,
		TotalDownloads:     active + waiting + stopped,
		// Aria2 doesn't readily provide free space info without querying specific paths
		FreeSpace: 0,
	}, nil
}

func (a *Aria2Integration) PauseTorrent(ctx context.Context, hash string) error {
	// aria2.pause(gid)
	_, err := a.call(ctx, "aria2.pause", hash)
	if err != nil {
		// Try forcePause if pause fails
		_, err = a.call(ctx, "aria2.forcePause", hash)
	}
	return err
}

func (a *Aria2Integration) ResumeTorrent(ctx context.Context, hash string) error {
	// aria2.unpause(gid)
	_, err := a.call(ctx, "aria2.unpause", hash)
	return err
}

// Helper methods

func (a *Aria2Integration) getTasks(ctx context.Context, method string, args ...interface{}) ([]integration.TorrentItem, error) {
	var tasks []aria2Task
	err := a.callAndBind(ctx, method, args, &tasks)
	if err != nil {
		return nil, err
	}

	var items []integration.TorrentItem
	for _, t := range tasks {
		items = append(items, a.mapTaskToItem(t))
	}
	return items, nil
}

func (a *Aria2Integration) mapTaskToItem(t aria2Task) integration.TorrentItem {
	total, _ := strconv.ParseInt(t.TotalLength, 10, 64)
	completed, _ := strconv.ParseInt(t.CompletedLength, 10, 64)
	downSpeed, _ := strconv.ParseInt(t.DownloadSpeed, 10, 64)
	upSpeed, _ := strconv.ParseInt(t.UploadSpeed, 10, 64)

	var progress float64
	if total > 0 {
		progress = float64(completed) / float64(total) * 100
	} else if t.Status == "complete" {
		progress = 100
	}

	// Name logic: try Bittorrent name, then single file path, then GID
	name := t.Bittorrent.Info.Name
	if name == "" && len(t.Files) > 0 {
		path := t.Files[0].Path
		parts := strings.Split(path, "/")
		if len(parts) > 0 {
			name = parts[len(parts)-1]
		}
	}
	if name == "" {
		name = t.GID
	}

	// Use GID as Hash
	id := t.GID

	// Map status
	state := t.Status // active, waiting, paused, error, complete, removed
	if state == "active" {
		state = "downloading"
	}

	// ETA
	eta := 0
	if downSpeed > 0 && total > completed {
		eta = int((total - completed) / downSpeed)
	}

	return integration.TorrentItem{
		Hash:          id,
		Name:          name,
		Size:          total,
		Progress:      progress,
		DownloadSpeed: downSpeed,
		UploadSpeed:   upSpeed,
		ETA:           eta,
		State:         state,
		Ratio:         0,
		AddedDate:     "",
	}
}

func (a *Aria2Integration) callAndBind(ctx context.Context, method string, args interface{}, target interface{}) error {
	res, err := a.call(ctx, method, args)
	if err != nil {
		return err
	}
	return json.Unmarshal(res, target)
}

func (a *Aria2Integration) call(ctx context.Context, method string, args interface{}) (json.RawMessage, error) {
	rpcURL := a.GetURL()
	if !strings.HasSuffix(rpcURL, "/jsonrpc") {
		rpcURL = strings.TrimSuffix(rpcURL, "/") + "/jsonrpc"
	}

	// Prepare params with token
	var params []interface{}
	token := a.GetSecret("token")
	if token == "" {
		token = a.GetSecret("secret")
	}
	if token != "" {
		params = append(params, "token:"+token)
	}

	// Flatten args
	if args != nil {
		switch v := args.(type) {
		case []interface{}:
			params = append(params, v...)
		case []string:
			for _, s := range v {
				params = append(params, s)
			}
		default:
			params = append(params, args)
		}
	}

	reqBody := jsonRPCRequest{
		JSONRPC: "2.0",
		Method:  method,
		ID:      "matrix-panel-" + strconv.FormatInt(time.Now().UnixNano(), 10),
		Params:  params,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, "POST", rpcURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := a.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var rpcResp jsonRPCResponse
	if err := json.Unmarshal(body, &rpcResp); err != nil {
		return nil, err
	}

	if rpcResp.Error != nil {
		return nil, fmt.Errorf("Aria2 RPC Error %d: %s", rpcResp.Error.Code, rpcResp.Error.Message)
	}

	return rpcResp.Result, nil
}
