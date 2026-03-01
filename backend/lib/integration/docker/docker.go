package docker

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

type DockerIntegration struct {
	*integration.BaseIntegration
}

func New(id, name, url string, secrets map[string]string) *DockerIntegration {
	return &DockerIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindDocker), url, secrets),
	}
}

// TestConnection 测试Docker连接
func (d *DockerIntegration) TestConnection(ctx context.Context) error {
	url := d.BuildURL("/version")
	resp, err := d.DoRequest(ctx, "GET", url, nil)
	if err != nil {
		return fmt.Errorf("连接Docker服务失败: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Docker服务返回异常状态: %d", resp.StatusCode)
	}

	return nil
}

// ListContainers 获取容器列表
func (d *DockerIntegration) ListContainers(ctx context.Context) ([]integration.DockerContainer, error) {
	url := d.BuildURL("/containers/json?all=true")
	resp, err := d.DoRequest(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取容器列表失败: HTTP %d", resp.StatusCode)
	}

	var rawContainers []struct {
		ID     string   `json:"Id"`
		Names  []string `json:"Names"`
		Image  string   `json:"Image"`
		State  string   `json:"State"`
		Status string   `json:"Status"`
		Ports  []struct {
			PrivatePort int    `json:"PrivatePort"`
			PublicPort  int    `json:"PublicPort"`
			Type        string `json:"Type"`
		} `json:"Ports"`
		Labels map[string]string `json:"Labels"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&rawContainers); err != nil {
		return nil, err
	}

	containers := make([]integration.DockerContainer, 0, len(rawContainers))
	for _, c := range rawContainers {
		name := ""
		if len(c.Names) > 0 {
			name = c.Names[0]
		}

		ports := make([]integration.DockerPort, 0, len(c.Ports))
		for _, p := range c.Ports {
			ports = append(ports, integration.DockerPort{
				PrivatePort: p.PrivatePort,
				PublicPort:  p.PublicPort,
				Type:        p.Type,
			})
		}

		containers = append(containers, integration.DockerContainer{
			ID:     c.ID,
			Name:   name,
			Image:  c.Image,
			State:  c.State,
			Status: c.Status,
			Ports:  ports,
			Labels: c.Labels,
		})
	}

	return containers, nil
}

// StartContainer 启动容器
func (d *DockerIntegration) StartContainer(ctx context.Context, containerID string) error {
	url := d.BuildURL(fmt.Sprintf("/containers/%s/start", containerID))
	resp, err := d.DoRequest(ctx, "POST", url, nil)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("启动容器失败: HTTP %d", resp.StatusCode)
	}

	return nil
}

// StopContainer 停止容器
func (d *DockerIntegration) StopContainer(ctx context.Context, containerID string) error {
	url := d.BuildURL(fmt.Sprintf("/containers/%s/stop", containerID))
	resp, err := d.DoRequest(ctx, "POST", url, nil)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("停止容器失败: HTTP %d", resp.StatusCode)
	}

	return nil
}

// RestartContainer 重启容器
func (d *DockerIntegration) RestartContainer(ctx context.Context, containerID string) error {
	url := d.BuildURL(fmt.Sprintf("/containers/%s/restart", containerID))
	resp, err := d.DoRequest(ctx, "POST", url, nil)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("重启容器失败: HTTP %d", resp.StatusCode)
	}

	return nil
}
