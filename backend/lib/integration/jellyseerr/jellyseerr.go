package jellyseerr

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// JellyseerrIntegration Jellyseerr媒体请求管理集成 (Jellyfin版Overseerr)
type JellyseerrIntegration struct {
	*integration.BaseIntegration
}

// New 创建Jellyseerr集成实例
func New(id, name, url string, secrets map[string]string) *JellyseerrIntegration {
	return &JellyseerrIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "jellyseerr", url, secrets),
	}
}

// TestConnection 测试Jellyseerr连接
func (j *JellyseerrIntegration) TestConnection(ctx context.Context) error {
	apiKey := j.GetSecret("apiKey")
	if apiKey == "" {
		return fmt.Errorf("API密钥未配置")
	}

	url := j.BuildURL("/api/v1/status")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return err
	}

	req.Header.Set("X-Api-Key", apiKey)
	resp, err := j.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("连接失败: HTTP %d", resp.StatusCode)
	}

	return nil
}

// GetRequests 获取媒体请求列表
func (j *JellyseerrIntegration) GetRequests(ctx context.Context) ([]MediaRequest, error) {
	apiKey := j.GetSecret("apiKey")
	url := j.BuildURL("/api/v1/request")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-Api-Key", apiKey)
	resp, err := j.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var response struct {
		Results []JellyseerrRequest `json:"results"`
	}
	json.NewDecoder(resp.Body).Decode(&response)

	result := make([]MediaRequest, 0)
	for _, r := range response.Results {
		result = append(result, MediaRequest{
			ID:     r.ID,
			Type:   r.Type,
			Status: r.Status,
		})
	}
	return result, nil
}

type MediaRequest struct {
	ID     int    `json:"id"`
	Type   string `json:"type"`
	Status int    `json:"status"`
}

type JellyseerrRequest struct {
	ID     int    `json:"id"`
	Type   string `json:"type"`
	Status int    `json:"status"`
}
