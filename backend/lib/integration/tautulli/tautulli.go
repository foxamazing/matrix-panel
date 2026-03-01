package tautulli

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// TautulliIntegration Tautulli Plex统计集成
type TautulliIntegration struct {
	*integration.BaseIntegration
}

// New 创建Tautulli集成实例
func New(id, name, url string, secrets map[string]string) *TautulliIntegration {
	return &TautulliIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "tautulli", url, secrets),
	}
}

// TestConnection 测试Tautulli连接
func (t *TautulliIntegration) TestConnection(ctx context.Context) error {
	apiKey := t.GetSecret("apiKey")
	if apiKey == "" {
		return fmt.Errorf("API密钥未配置")
	}

	url := t.BuildURL("/api/v2")
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)

	q := req.URL.Query()
	q.Add("apikey", apiKey)
	q.Add("cmd", "status")
	req.URL.RawQuery = q.Encode()

	resp, err := t.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("连接失败: HTTP %d", resp.StatusCode)
	}
	return nil
}

// GetActivity 获取播放活动
func (t *TautulliIntegration) GetActivity(ctx context.Context) (*Activity, error) {
	apiKey := t.GetSecret("apiKey")
	url := t.BuildURL("/api/v2")
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)

	q := req.URL.Query()
	q.Add("apikey", apiKey)
	q.Add("cmd", "get_activity")
	req.URL.RawQuery = q.Encode()

	resp, err := t.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var response struct {
		Response struct {
			Data Activity `json:"data"`
		} `json:"response"`
	}
	json.NewDecoder(resp.Body).Decode(&response)
	return &response.Response.Data, nil
}

type Activity struct {
	StreamCount int `json:"stream_count"`
}
