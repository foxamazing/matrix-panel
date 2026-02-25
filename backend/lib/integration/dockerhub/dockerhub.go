package dockerhub

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// DockerHubIntegration represents a Docker Hub integration
type DockerHubIntegration struct {
	Username string
	client   *http.Client
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

// RepositoryTag represents a Docker image tag
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

// NewDockerHubIntegration creates a new Docker Hub integration
func NewDockerHubIntegration(username string) *DockerHubIntegration {
	return &DockerHubIntegration{
		Username: username,
		client: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

// TestConnection tests the Docker Hub connection
func (d *DockerHubIntegration) TestConnection() error {
	url := fmt.Sprintf("https://hub.docker.com/v2/users/%s", d.Username)

	resp, err := d.client.Get(url)
	if err != nil {
		return fmt.Errorf("failed to connect to Docker Hub: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == 404 {
		return fmt.Errorf("user not found: %s", d.Username)
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Docker Hub returned status code %d", resp.StatusCode)
	}

	return nil
}

// GetRepositories retrieves user's repositories
func (d *DockerHubIntegration) GetRepositories(limit int) ([]Repository, error) {
	url := fmt.Sprintf("https://hub.docker.com/v2/repositories/%s/?page_size=%d",
		d.Username, limit)

	resp, err := d.client.Get(url)
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

// GetTags retrieves tags for a specific repository
func (d *DockerHubIntegration) GetTags(repository string, limit int) ([]Tag, error) {
	url := fmt.Sprintf("https://hub.docker.com/v2/repositories/%s/%s/tags/?page_size=%d",
		d.Username, repository, limit)

	resp, err := d.client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to get tags: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Docker Hub returned status code %d", resp.StatusCode)
	}

	var result struct {
		Results []Tag `json:"results"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode tags: %w", err)
	}

	return result.Results, nil
}
