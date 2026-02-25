package openmediavault

import (
	"context"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// OpenMediaVaultIntegration OpenMediaVault NAS管理集成
type OpenMediaVaultIntegration struct {
	*integration.BaseIntegration
}

// New 创建OpenMediaVault集成实例
func New(id, name, url string, secrets map[string]string) *OpenMediaVaultIntegration {
	return &OpenMediaVaultIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "openmediavault", url, secrets),
	}
}

// TestConnection 测试OpenMediaVault连接
func (o *OpenMediaVaultIntegration) TestConnection(ctx context.Context) error {
	username := o.GetSecret("username")
	password := o.GetSecret("password")

	if username == "" || password == "" {
		return fmt.Errorf("用户名或密码未配置")
	}

	url := o.BuildURL("/rpc.php")
	req, _ := http.NewRequestWithContext(ctx, "POST", url, nil)
	req.SetBasicAuth(username, password)

	resp, err := o.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized {
		return fmt.Errorf("认证失败")
	}
	return nil
}
