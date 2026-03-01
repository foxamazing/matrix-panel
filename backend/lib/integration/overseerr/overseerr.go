package overseerr

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// OverseerrIntegration Overseerr媒体请求管理集成
type OverseerrIntegration struct {
	*integration.BaseIntegration
}

// New 创建Overseerr集成实例
func New(id, name, url string, secrets map[string]string) *OverseerrIntegration {
	return &OverseerrIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "overseerr", url, secrets),
	}
}

// TestConnection 测试Overseerr连接
func (o *OverseerrIntegration) TestConnection(ctx context.Context) error {
	apiKey := o.GetSecret("apiKey")
	if apiKey == "" {
		return fmt.Errorf("API密钥未配置")
	}

	url := o.BuildURL("/api/v1/status")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("X-Api-Key", apiKey)
	resp, err := o.Client.Do(req)
	if err != nil {
		return fmt.Errorf("连接失败: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("服务器返回错误状态: %d", resp.StatusCode)
	}

	return nil
}

// GetRequests 获取媒体请求列表
func (o *OverseerrIntegration) GetRequests(ctx context.Context, limit int) ([]MediaRequest, error) {
	apiKey := o.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	url := o.BuildURL("/api/v1/request")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	q := req.URL.Query()
	if limit > 0 {
		q.Add("take", fmt.Sprintf("%d", limit))
	}
	req.URL.RawQuery = q.Encode()

	req.Header.Set("X-Api-Key", apiKey)
	resp, err := o.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取请求失败: HTTP %d", resp.StatusCode)
	}

	var response struct {
		Results []OverseerrRequest `json:"results"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	result := make([]MediaRequest, 0, len(response.Results))
	for _, r := range response.Results {
		request := MediaRequest{
			ID:          r.ID,
			Type:        r.Type,
			Status:      r.Status,
			RequestedBy: r.RequestedBy.DisplayName,
			Media: MediaInfo{
				Title:     r.Media.Title,
				PosterURL: r.Media.PosterPath,
			},
		}
		result = append(result, request)
	}

	return result, nil
}

// GetRequestCount 获取请求统计
func (o *OverseerrIntegration) GetRequestCount(ctx context.Context) (*RequestStats, error) {
	apiKey := o.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	url := o.BuildURL("/api/v1/request/count")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-Api-Key", apiKey)
	resp, err := o.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取统计失败: HTTP %d", resp.StatusCode)
	}

	var stats RequestStats
	if err := json.NewDecoder(resp.Body).Decode(&stats); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	return &stats, nil
}
