package ntfy

import (
	"bytes"
	"context"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// NTFYIntegration NTFY通知服务集成
type NTFYIntegration struct {
	*integration.BaseIntegration
}

// New 创建NTFY集成实例
func New(id, name, url string, secrets map[string]string) *NTFYIntegration {
	return &NTFYIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "ntfy", url, secrets),
	}
}

// TestConnection 测试NTFY连接
func (n *NTFYIntegration) TestConnection(ctx context.Context) error {
	// NTFY通常不需要认证就能访问服务器
	url := n.BuildURL("/")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return err
	}

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

// SendNotification 发送通知
func (n *NTFYIntegration) SendNotification(ctx context.Context, topic, title, message string, priority int) error {
	url := n.BuildURL("/" + topic)

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBufferString(message))
	if err != nil {
		return err
	}

	if title != "" {
		req.Header.Set("Title", title)
	}
	if priority > 0 {
		req.Header.Set("Priority", fmt.Sprintf("%d", priority))
	}

	// 如果配置了Token
	token := n.GetSecret("token")
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}

	resp, err := n.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("发送通知失败: HTTP %d", resp.StatusCode)
	}

	return nil
}
