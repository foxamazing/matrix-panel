package gotify

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// GotifyIntegration Gotify实时通知集成
type GotifyIntegration struct {
	*integration.BaseIntegration
}

// New 创建Gotify集成实例
func New(id, name, url string, secrets map[string]string) *GotifyIntegration {
	return &GotifyIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "gotify", url, secrets),
	}
}

// TestConnection 测试Gotify连接
func (g *GotifyIntegration) TestConnection(ctx context.Context) error {
	token := g.GetSecret("token")
	if token == "" {
		return fmt.Errorf("Token未配置")
	}

	url := g.BuildURL("/health")
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	resp, err := g.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return nil
}

// SendMessage 发送消息
func (g *GotifyIntegration) SendMessage(ctx context.Context, title, message string, priority int) error {
	token := g.GetSecret("token")
	url := g.BuildURL("/message")

	body := map[string]interface{}{
		"title":    title,
		"message":  message,
		"priority": priority,
	}
	data, _ := json.Marshal(body)

	req, _ := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(data))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Gotify-Key", token)

	resp, err := g.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return nil
}
