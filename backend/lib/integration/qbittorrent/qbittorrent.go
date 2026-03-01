package qbittorrent

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"matrix-panel/lib/integration"
	"net/http"
	"net/url"
	"strings"
)

// QBittorrentIntegration qBittorrent下载客户端集成
type QBittorrentIntegration struct {
	*integration.BaseIntegration
	cookie string // 登录后的cookie
}

// New 创建qBittorrent集成实例
func New(id, name, url string, secrets map[string]string) *QBittorrentIntegration {
	return &QBittorrentIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindQBittorrent), url, secrets),
	}
}

// TestConnection 测试qBittorrent连接
func (q *QBittorrentIntegration) TestConnection(ctx context.Context) error {
	username := q.GetSecret("username")
	password := q.GetSecret("password")

	if username == "" || password == "" {
		return fmt.Errorf("用户名或密码未配置")
	}

	// 尝试登录
	if err := q.login(ctx, username, password); err != nil {
		return fmt.Errorf("登录失败: %w", err)
	}

	return nil
}

// login 登录qBittorrent
func (q *QBittorrentIntegration) login(ctx context.Context, username, password string) error {
	loginURL := q.BuildURL("/api/v2/auth/login")

	data := url.Values{}
	data.Set("username", username)
	data.Set("password", password)

	req, err := http.NewRequestWithContext(ctx, "POST", loginURL, strings.NewReader(data.Encode()))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := q.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if string(body) != "Ok." {
		return fmt.Errorf("登录失败: %s", string(body))
	}

	// 保存cookie
	for _, cookie := range resp.Cookies() {
		if cookie.Name == "SID" {
			q.cookie = cookie.Value
			break
		}
	}

	if q.cookie == "" {
		return fmt.Errorf("未获取到登录cookie")
	}

	return nil
}

// ensureLogin 确保已登录
func (q *QBittorrentIntegration) ensureLogin(ctx context.Context) error {
	if q.cookie != "" {
		return nil
	}

	username := q.GetSecret("username")
	password := q.GetSecret("password")

	return q.login(ctx, username, password)
}

// doAuthRequest 执行认证请求
func (q *QBittorrentIntegration) doAuthRequest(ctx context.Context, method, path string) (*http.Response, error) {
	if err := q.ensureLogin(ctx); err != nil {
		return nil, err
	}

	url := q.BuildURL(path)
	req, err := http.NewRequestWithContext(ctx, method, url, nil)
	if err != nil {
		return nil, err
	}

	req.AddCookie(&http.Cookie{
		Name:  "SID",
		Value: q.cookie,
	})

	return q.Client.Do(req)
}

// GetTorrents 获取所有下载任务
func (q *QBittorrentIntegration) GetTorrents(ctx context.Context) ([]integration.TorrentItem, error) {
	resp, err := q.doAuthRequest(ctx, "GET", "/api/v2/torrents/info")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取种子列表失败: HTTP %d", resp.StatusCode)
	}

	var torrents []QBTorrent
	if err := json.NewDecoder(resp.Body).Decode(&torrents); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	// 转换为统一格式
	result := make([]integration.TorrentItem, 0, len(torrents))
	for _, t := range torrents {
		item := integration.TorrentItem{
			Hash:          t.Hash,
			Name:          t.Name,
			Size:          t.Size,
			Progress:      t.Progress * 100, // 转换为百分比
			DownloadSpeed: t.Dlspeed,
			UploadSpeed:   t.Upspeed,
			ETA:           t.Eta,
			State:         t.State,
			Ratio:         t.Ratio,
			AddedDate:     fmt.Sprintf("%d", t.AddedOn),
		}
		result = append(result, item)
	}

	return result, nil
}

// GetStatus 获取客户端状态
func (q *QBittorrentIntegration) GetStatus(ctx context.Context) (*integration.ClientStatus, error) {
	resp, err := q.doAuthRequest(ctx, "GET", "/api/v2/transfer/info")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取状态失败: HTTP %d", resp.StatusCode)
	}

	var transferInfo QBTransferInfo
	if err := json.NewDecoder(resp.Body).Decode(&transferInfo); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	// 获取种子数量
	torrents, err := q.GetTorrents(ctx)
	if err != nil {
		return nil, err
	}

	activeDownloads := 0
	for _, t := range torrents {
		if t.State == "downloading" || t.State == "metaDL" {
			activeDownloads++
		}
	}

	status := &integration.ClientStatus{
		TotalDownloadSpeed: transferInfo.DlInfoSpeed,
		TotalUploadSpeed:   transferInfo.UpInfoSpeed,
		ActiveDownloads:    activeDownloads,
		TotalDownloads:     len(torrents),
		FreeSpace:          transferInfo.FreeSpaceOnDisk,
	}

	return status, nil
}

// PauseTorrent 暂停下载
func (q *QBittorrentIntegration) PauseTorrent(ctx context.Context, hash string) error {
	data := url.Values{}
	data.Set("hashes", hash)

	return q.doTorrentAction(ctx, "/api/v2/torrents/pause", data)
}

// ResumeTorrent 恢复下载
func (q *QBittorrentIntegration) ResumeTorrent(ctx context.Context, hash string) error {
	data := url.Values{}
	data.Set("hashes", hash)

	return q.doTorrentAction(ctx, "/api/v2/torrents/resume", data)
}

// doTorrentAction 执行种子操作
func (q *QBittorrentIntegration) doTorrentAction(ctx context.Context, path string, data url.Values) error {
	if err := q.ensureLogin(ctx); err != nil {
		return err
	}

	url := q.BuildURL(path)
	req, err := http.NewRequestWithContext(ctx, "POST", url, strings.NewReader(data.Encode()))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.AddCookie(&http.Cookie{
		Name:  "SID",
		Value: q.cookie,
	})

	resp, err := q.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("操作失败: HTTP %d", resp.StatusCode)
	}

	return nil
}

// qBittorrent API 数据结构

type QBTorrent struct {
	Hash     string  `json:"hash"`
	Name     string  `json:"name"`
	Size     int64   `json:"size"`
	Progress float64 `json:"progress"` // 0-1
	Dlspeed  int64   `json:"dlspeed"`
	Upspeed  int64   `json:"upspeed"`
	Eta      int     `json:"eta"`
	State    string  `json:"state"`
	Ratio    float64 `json:"ratio"`
	AddedOn  int64   `json:"added_on"`
}

type QBTransferInfo struct {
	DlInfoSpeed     int64 `json:"dl_info_speed"`
	UpInfoSpeed     int64 `json:"up_info_speed"`
	FreeSpaceOnDisk int64 `json:"free_space_on_disk"`
}
