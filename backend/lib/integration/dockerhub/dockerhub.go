package dockerhub

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
	"time"
)

// DockerHubIntegration represents a Docker Hub integration
type DockerHubIntegration struct {
	*integration.BaseIntegration
}

// New 创建 Docker Hub 集成实例
func New(id, name, url string, secrets map[string]string) *DockerHubIntegration {
	if url == "" {
		url = "https://hub.docker.com"
	}
	return &DockerHubIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "dockerhub", url, secrets),
	}
}

// Repository represents a Docker Hub repository
type Repository struct {
	Name            string    `json:"name"`
	Namespace       string    `json:"namespace"`
	Description     string    `json:"description"`
	IsPrivate       bool      `json:"is_private"`
	StarCount       int       `json:"star_count"`
	PullCount       int       `json:"pull_count"`
	LastUpdated     time.Time `json:"last_updated"`
	RepositoryType  string    `json:"repository_type"`
	FullDescription string    `json:"full_description"`
}

// Tag represents a Docker image tag
type Tag struct {
	Name        string    `json:"name"`
	FullSize    int64     `json:"full_size"`
	Images      []Image   `json:"images"`
	LastUpdated time.Time `json:"last_updated"`
	LastUpdater string    `json:"last_updater_username"`
}

// Image represents a Docker image within a tag
type Image struct {
	Architecture string `json:"architecture"`
	OS           string `json:"os"`
	Size         int64  `json:"size"`
}

// TestConnection tests the Docker Hub connection
func (d *DockerHubIntegration) TestConnection(ctx context.Context) error {
	username := d.GetSecret("username")
	if username == "" {
		return fmt.Errorf("Docker Hub 用户名未配置")
	}

	url := fmt.Sprintf("%s/v2/users/%s", d.URL, username)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return err
	}

	resp, err := d.Client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to connect to Docker Hub: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return fmt.Errorf("user not found: %s", username)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Docker Hub returned status code %d", resp.StatusCode)
	}

	return nil
}

// GetRepositories retrieves user's repositories
func (d *DockerHubIntegration) GetRepositories(ctx context.Context, limit int) ([]Repository, error) {
	username := d.GetSecret("username")
	url := fmt.Sprintf("%s/v2/repositories/%s/?page_size=%d", d.URL, username, limit)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := d.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get repositories: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Docker Hub returned status code %d", resp.StatusCode)
	}

	var result struct {
		Results []Repository `json:"results"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode repositories: %w", err)
	}

	return result.Results, nil
}
