package nzbget

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// NZBGetIntegration NZBGet Usenet下载客户端集成
type NZBGetIntegration struct {
	*integration.BaseIntegration
}

// New 创建NZBGet集成实例
func New(id, name, url string, secrets map[string]string) *NZBGetIntegration {
	return &NZBGetIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "nzbget", url, secrets),
	}
}

// TestConnection 测试NZBGet连接
func (n *NZBGetIntegration) TestConnection(ctx context.Context) error {
	username := n.GetSecret("username")
	password := n.GetSecret("password")

	url := n.BuildURL("/jsonrpc/version")
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.SetBasicAuth(username, password)

	resp, err := n.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("连接失败: HTTP %d", resp.StatusCode)
	}
	return nil
}

// GetStatus 获取下载状态
func (n *NZBGetIntegration) GetStatus(ctx context.Context) (*DownloadStatus, error) {
	username := n.GetSecret("username")
	password := n.GetSecret("password")

	url := n.BuildURL("/jsonrpc/status")
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.SetBasicAuth(username, password)

	resp, err := n.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var status DownloadStatus
	json.NewDecoder(resp.Body).Decode(&status)
	return &status, nil
}

type DownloadStatus struct {
	DownloadRate    int `json:"DownloadRate"`
	RemainingSizeMB int `json:"RemainingSizeMB"`
}
