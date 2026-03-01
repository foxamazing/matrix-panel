package grafana

import (
	"context"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// GrafanaIntegration Grafana可视化监控集成
type GrafanaIntegration struct {
	*integration.BaseIntegration
}

// New 创建Grafana集成实例
func New(id, name, url string, secrets map[string]string) *GrafanaIntegration {
	return &GrafanaIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "grafana", url, secrets),
	}
}

// TestConnection 测试Grafana连接
func (g *GrafanaIntegration) TestConnection(ctx context.Context) error {
	apiKey := g.GetSecret("apiKey")
	if apiKey == "" {
		return fmt.Errorf("API密钥未配置")
	}

	url := g.BuildURL("/api/health")
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := g.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("连接失败: HTTP %d", resp.StatusCode)
	}
	return nil
}
