package nextcloud

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// NextcloudIntegration Nextcloud云存储集成
type NextcloudIntegration struct {
	*integration.BaseIntegration
}

// New 创建Nextcloud集成实例
func New(id, name, url string, secrets map[string]string) *NextcloudIntegration {
	return &NextcloudIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "nextcloud", url, secrets),
	}
}

// TestConnection 测试Nextcloud连接
func (n *NextcloudIntegration) TestConnection(ctx context.Context) error {
	username := n.GetSecret("username")
	password := n.GetSecret("password")

	if username == "" || password == "" {
		return fmt.Errorf("用户名或密码未配置")
	}

	url := n.BuildURL("/ocs/v2.php/apps/serverinfo/api/v1/info")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return err
	}

	req.SetBasicAuth(username, password)
	req.Header.Set("OCS-APIRequest", "true")

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

// GetServerInfo 获取服务器信息
func (n *NextcloudIntegration) GetServerInfo(ctx context.Context) (*ServerInfo, error) {
	username := n.GetSecret("username")
	password := n.GetSecret("password")

	url := n.BuildURL("/ocs/v2.php/apps/serverinfo/api/v1/info")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.SetBasicAuth(username, password)
	req.Header.Set("OCS-APIRequest", "true")
	req.Header.Set("Accept", "application/json")

	q := req.URL.Query()
	q.Add("format", "json")
	req.URL.RawQuery = q.Encode()

	resp, err := n.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取信息失败: HTTP %d", resp.StatusCode)
	}

	var response struct {
		Ocs struct {
			Data NextcloudServerInfo `json:"data"`
		} `json:"ocs"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, err
	}

	info := &ServerInfo{
		Version:     response.Ocs.Data.Nextcloud.System.Version,
		FreeSpace:   response.Ocs.Data.Nextcloud.System.Freespace,
		ActiveUsers: response.Ocs.Data.ActiveUsers.Last24Hours,
	}

	return info, nil
}
