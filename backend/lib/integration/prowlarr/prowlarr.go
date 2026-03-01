package prowlarr

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// ProwlarrIntegration Prowlarr索引管理集成
type ProwlarrIntegration struct {
	*integration.BaseIntegration
}

// New 创建Prowlarr集成实例
func New(id, name, url string, secrets map[string]string) *ProwlarrIntegration {
	return &ProwlarrIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindProwlarr), url, secrets),
	}
}

// TestConnection 测试Prowlarr连接
func (p *ProwlarrIntegration) TestConnection(ctx context.Context) error {
	apiKey := p.GetSecret("apiKey")
	if apiKey == "" {
		return fmt.Errorf("API密钥未配置")
	}

	url := p.BuildURL("/api/v1/system/status")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("X-Api-Key", apiKey)
	resp, err := p.Client.Do(req)
	if err != nil {
		return fmt.Errorf("连接失败: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("服务器返回错误状态: %d", resp.StatusCode)
	}

	return nil
}

// GetIndexers 获取所有索引器
func (p *ProwlarrIntegration) GetIndexers(ctx context.Context) ([]Indexer, error) {
	apiKey := p.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	url := p.BuildURL("/api/v1/indexer")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-Api-Key", apiKey)
	resp, err := p.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取索引器失败: HTTP %d", resp.StatusCode)
	}

	var prowlarrIndexers []ProwlarrIndexer
	if err := json.NewDecoder(resp.Body).Decode(&prowlarrIndexers); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	result := make([]Indexer, 0, len(prowlarrIndexers))
	for _, idx := range prowlarrIndexers {
		indexer := Indexer{
			ID:       idx.ID,
			Name:     idx.Name,
			Protocol: idx.Protocol,
			Enable:   idx.Enable,
		}
		result = append(result, indexer)
	}

	return result, nil
}

// GetIndexerStats 获取索引器统计
func (p *ProwlarrIntegration) GetIndexerStats(ctx context.Context) (*IndexerStats, error) {
	apiKey := p.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	url := p.BuildURL("/api/v1/indexerstats")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-Api-Key", apiKey)
	resp, err := p.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取统计失败: HTTP %d", resp.StatusCode)
	}

	var stats ProwlarrIndexerStats
	if err := json.NewDecoder(resp.Body).Decode(&stats); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	result := &IndexerStats{
		TotalIndexers:   len(stats.Indexers),
		EnabledIndexers: 0,
		TotalQueries:    stats.TotalQueries,
		TotalGrabs:      stats.TotalGrabs,
	}

	for _, idx := range stats.Indexers {
		if idx.Enable {
			result.EnabledIndexers++
		}
	}

	return result, nil
}
