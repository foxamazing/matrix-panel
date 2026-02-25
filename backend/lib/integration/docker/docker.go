package docker

import (
	"context"
	"fmt"

	"matrix-panel/lib/integration"
)

type DockerIntegration struct {
	*integration.BaseIntegration
}

func New(id, name string, secrets map[string]string) *DockerIntegration {
	host := "local-docker"
	if secrets["socket_path"] != "" {
		host = secrets["socket_path"]
	}

	return &DockerIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindDocker), host, secrets),
	}
}

func (d *DockerIntegration) TestConnection(ctx context.Context) error {
	return fmt.Errorf("Docker 集成暂未在当前构建中启用")
}

func (d *DockerIntegration) ListContainers(ctx context.Context) ([]integration.DockerContainer, error) {
	return nil, fmt.Errorf("Docker 集成暂未在当前构建中启用")
}

func (d *DockerIntegration) StartContainer(ctx context.Context, containerID string) error {
	return fmt.Errorf("Docker 集成暂未在当前构建中启用")
}

func (d *DockerIntegration) StopContainer(ctx context.Context, containerID string) error {
	return fmt.Errorf("Docker 集成暂未在当前构建中启用")
}

func (d *DockerIntegration) RestartContainer(ctx context.Context, containerID string) error {
	return fmt.Errorf("Docker 集成暂未在当前构建中启用")
}

func (d *DockerIntegration) GetURL() string {
	return d.BaseIntegration.URL
}
