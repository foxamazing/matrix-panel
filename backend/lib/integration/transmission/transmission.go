package transmission

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"matrix-panel/lib/integration"
	"net/http"
)

// TransmissionIntegration Transmission下载客户端集成
type TransmissionIntegration struct {
	*integration.BaseIntegration
	sessionID string
}

// New 创建Transmission集成实例
func New(id, name, url string, secrets map[string]string) *TransmissionIntegration {
	return &TransmissionIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindTransmission), url, secrets),
	}
}

// TestConnection 测试连接
func (t *TransmissionIntegration) TestConnection(ctx context.Context) error {
	_, err := t.doRequest(ctx, "session-get", nil)
	return err
}

// GetTorrents 获取所有下载任务
func (t *TransmissionIntegration) GetTorrents(ctx context.Context) ([]integration.TorrentItem, error) {
	args := map[string]interface{}{
		"fields": []string{
			"hashString", "name", "totalSize", "percentDone",
			"rateDownload", "rateUpload", "eta", "status",
			"uploadRatio", "addedDate",
		},
	}

	resp, err := t.doRequest(ctx, "torrent-get", args)
	if err != nil {
		return nil, err
	}

	var result struct {
		Arguments struct {
			Torrents []struct {
				HashString   string  `json:"hashString"`
				Name         string  `json:"name"`
				TotalSize    int64   `json:"totalSize"`
				PercentDone  float64 `json:"percentDone"`
				RateDownload int64   `json:"rateDownload"`
				RateUpload   int64   `json:"rateUpload"`
				Eta          int     `json:"eta"`
				Status       int     `json:"status"`
				UploadRatio  float64 `json:"uploadRatio"`
				AddedDate    int64   `json:"addedDate"`
			} `json:"torrents"`
		} `json:"arguments"`
	}

	if err := json.Unmarshal(resp, &result); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	items := make([]integration.TorrentItem, 0, len(result.Arguments.Torrents))
	for _, tr := range result.Arguments.Torrents {
		items = append(items, integration.TorrentItem{
			Hash:          tr.HashString,
			Name:          tr.Name,
			Size:          tr.TotalSize,
			Progress:      tr.PercentDone * 100,
			DownloadSpeed: tr.RateDownload,
			UploadSpeed:   tr.RateUpload,
			ETA:           tr.Eta,
			State:         mapStatus(tr.Status),
			Ratio:         tr.UploadRatio,
			AddedDate:     fmt.Sprintf("%d", tr.AddedDate),
		})
	}

	return items, nil
}

// GetStatus 获取客户端状态
func (t *TransmissionIntegration) GetStatus(ctx context.Context) (*integration.ClientStatus, error) {
	// 获取会话统计
	resp, err := t.doRequest(ctx, "session-stats", nil)
	if err != nil {
		return nil, err
	}

	var stats struct {
		Arguments struct {
			ActiveTorrentCount int   `json:"activeTorrentCount"`
			TorrentCount       int   `json:"torrentCount"`
			DownloadSpeed      int64 `json:"downloadSpeed"`
			UploadSpeed        int64 `json:"uploadSpeed"`
		} `json:"arguments"`
	}

	if err := json.Unmarshal(resp, &stats); err != nil {
		return nil, fmt.Errorf("解析统计失败: %w", err)
	}

	// 获取剩余空间 (需要 session-get)
	respSession, err := t.doRequest(ctx, "session-get", map[string]interface{}{
		"fields": []string{"download-dir-free-space"},
	})

	var freeSpace int64
	if err == nil {
		var sessionInfo struct {
			Arguments struct {
				DownloadDirFreeSpace int64 `json:"download-dir-free-space"`
			} `json:"arguments"`
		}
		if json.Unmarshal(respSession, &sessionInfo) == nil {
			freeSpace = sessionInfo.Arguments.DownloadDirFreeSpace
		}
	}

	return &integration.ClientStatus{
		TotalDownloadSpeed: stats.Arguments.DownloadSpeed,
		TotalUploadSpeed:   stats.Arguments.UploadSpeed,
		ActiveDownloads:    stats.Arguments.ActiveTorrentCount,
		TotalDownloads:     stats.Arguments.TorrentCount,
		FreeSpace:          freeSpace,
	}, nil
}

// PauseTorrent 暂停下载
func (t *TransmissionIntegration) PauseTorrent(ctx context.Context, hash string) error {
	_, err := t.doRequest(ctx, "torrent-stop", map[string]interface{}{
		"ids": []string{hash},
	})
	return err
}

// ResumeTorrent 恢复下载
func (t *TransmissionIntegration) ResumeTorrent(ctx context.Context, hash string) error {
	_, err := t.doRequest(ctx, "torrent-start", map[string]interface{}{
		"ids": []string{hash},
	})
	return err
}

// doRequest 执行RPC请求
func (t *TransmissionIntegration) doRequest(ctx context.Context, method string, args map[string]interface{}) ([]byte, error) {
	reqBody := map[string]interface{}{
		"method": method,
	}
	if args != nil {
		reqBody["arguments"] = args
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	url := t.BuildURL("/transmission/rpc")

	// 辅助函数：创建并发送请求
	send := func() (*http.Response, error) {
		req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(jsonBody))
		if err != nil {
			return nil, err
		}

		req.Header.Set("Content-Type", "application/json")
		if t.sessionID != "" {
			req.Header.Set("X-Transmission-Session-Id", t.sessionID)
		}

		username := t.GetSecret("username")
		password := t.GetSecret("password")
		if username != "" {
			req.SetBasicAuth(username, password)
		}

		return t.Client.Do(req)
	}

	resp, err := send()
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// 处理CSRF Token (Session ID) 过期/缺失
	if resp.StatusCode == 409 {
		t.sessionID = resp.Header.Get("X-Transmission-Session-Id")
		if t.sessionID == "" {
			return nil, fmt.Errorf("无法获取Transmission Session ID")
		}
		// 重试
		resp, err = send()
		if err != nil {
			return nil, err
		}
		defer resp.Body.Close()
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("请求失败: HTTP %d", resp.StatusCode)
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var baseResp struct {
		Result string `json:"result"`
	}

	if err := json.Unmarshal(bodyBytes, &baseResp); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	if baseResp.Result != "success" {
		return nil, fmt.Errorf("Transmission错误: %s", baseResp.Result)
	}

	return bodyBytes, nil
}

// mapStatus 映射状态码
func mapStatus(status int) string {
	switch status {
	case 0:
		return "stopped"
	case 1:
		return "check_wait"
	case 2:
		return "checking"
	case 3:
		return "download_wait"
	case 4:
		return "downloading"
	case 5:
		return "seed_wait"
	case 6:
		return "seeding"
	default:
		return "unknown"
	}
}
