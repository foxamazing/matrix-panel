package deluge

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// DelugeIntegration Deluge下载客户端集成
type DelugeIntegration struct {
	*integration.BaseIntegration
	cookie string
}

// New 创建Deluge集成实例
func New(id, name, url string, secrets map[string]string) *DelugeIntegration {
	return &DelugeIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "deluge", url, secrets),
	}
}

// TestConnection 测试Deluge连接
func (d *DelugeIntegration) TestConnection(ctx context.Context) error {
	password := d.GetSecret("password")
	if password == "" {
		return fmt.Errorf("密码未配置")
	}

	return d.login(ctx, password)
}

// login 登录Deluge
func (d *DelugeIntegration) login(ctx context.Context, password string) error {
	url := d.BuildURL("/json")

	requestBody := map[string]interface{}{
		"method": "auth.login",
		"params": []string{password},
		"id":     1,
	}

	body, _ := json.Marshal(requestBody)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	resp, err := d.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var response struct {
		Result bool `json:"result"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return err
	}

	if !response.Result {
		return fmt.Errorf("登录失败")
	}

	// 保存Cookie
	for _, cookie := range resp.Cookies() {
		if cookie.Name == "_session_id" {
			d.cookie = cookie.Value
			break
		}
	}

	return nil
}

// GetTorrents 获取种子列表
func (d *DelugeIntegration) GetTorrents(ctx context.Context) ([]TorrentInfo, error) {
	if err := d.ensureLogin(ctx); err != nil {
		return nil, err
	}

	url := d.BuildURL("/json")
	requestBody := map[string]interface{}{
		"method": "web.update_ui",
		"params": []interface{}{
			[]string{"name", "state", "progress", "download_payload_rate", "upload_payload_rate", "eta", "ratio"},
			map[string]interface{}{},
		},
		"id": 1,
	}

	body, _ := json.Marshal(requestBody)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(&http.Cookie{Name: "_session_id", Value: d.cookie})

	resp, err := d.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var response struct {
		Result struct {
			Torrents map[string]DelugeTorrent `json:"torrents"`
		} `json:"result"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, err
	}

	result := make([]TorrentInfo, 0)
	for hash, torrent := range response.Result.Torrents {
		info := TorrentInfo{
			Hash:      hash,
			Name:      torrent.Name,
			State:     torrent.State,
			Progress:  torrent.Progress,
			DownSpeed: torrent.DownloadRate,
			UpSpeed:   torrent.UploadRate,
			ETA:       torrent.ETA,
			Ratio:     torrent.Ratio,
		}
		result = append(result, info)
	}

	return result, nil
}

func (d *DelugeIntegration) ensureLogin(ctx context.Context) error {
	if d.cookie != "" {
		return nil
	}
	password := d.GetSecret("password")
	return d.login(ctx, password)
}
