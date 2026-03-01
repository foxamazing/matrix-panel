package portainer

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// PortainerIntegration Portainer Docker管理集成
type PortainerIntegration struct {
	*integration.BaseIntegration
	token string
}

// New 创建Portainer集成实例
func New(id, name, url string, secrets map[string]string) *PortainerIntegration {
	return &PortainerIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "portainer", url, secrets),
	}
}

// TestConnection 测试Portainer连接
func (p *PortainerIntegration) TestConnection(ctx context.Context) error {
	return p.authenticate(ctx)
}

// authenticate 认证获取Token
func (p *PortainerIntegration) authenticate(ctx context.Context) error {
	username := p.GetSecret("username")
	password := p.GetSecret("password")

	url := p.BuildURL("/api/auth")
	body := map[string]string{"Username": username, "Password": password}
	bodyData, _ := json.Marshal(body)

	req, _ := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(bodyData))
	req.Header.Set("Content-Type", "application/json")

	resp, err := p.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var response struct {
		Jwt string `json:"jwt"`
	}
	json.NewDecoder(resp.Body).Decode(&response)
	p.token = response.Jwt
	return nil
}

// GetContainers 获取容器列表
func (p *PortainerIntegration) GetContainers(ctx context.Context) ([]Container, error) {
	if err := p.authenticate(ctx); err != nil {
		return nil, err
	}

	url := p.BuildURL("/api/endpoints/1/docker/containers/json")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+p.token)

	resp, err := p.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch containers: %w", err)
	}
	defer resp.Body.Close()

	// TODO: 解析容器列表
	var containers []Container
	if err := json.NewDecoder(resp.Body).Decode(&containers); err != nil {
		return nil, fmt.Errorf("failed to decode containers: %w", err)
	}

	return containers, nil
}

type Container struct {
	ID    string   `json:"Id"`
	Names []string `json:"Names"`
	State string   `json:"State"`
}
