package gitlab

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
	"time"
)

// GitLabIntegration represents a GitLab integration
type GitLabIntegration struct {
	*integration.BaseIntegration
}

// New 创建 GitLab 集成实例
func New(id, name, url string, secrets map[string]string) *GitLabIntegration {
	if url == "" {
		url = "https://gitlab.com"
	}
	return &GitLabIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "gitlab", url, secrets),
	}
}

// Project represents a GitLab project
type Project struct {
	ID              int       `json:"id"`
	Name            string    `json:"name"`
	Description     string    `json:"description"`
	WebURL          string    `json:"web_url"`
	StarCount       int       `json:"star_count"`
	ForksCount      int       `json:"forks_count"`
	OpenIssuesCount int       `json:"open_issues_count"`
	LastActivityAt  time.Time `json:"last_activity_at"`
	DefaultBranch   string    `json:"default_branch"`
	Visibility      string    `json:"visibility"`
}

// Pipeline represents a GitLab CI/CD pipeline
type Pipeline struct {
	ID        int       `json:"id"`
	Ref       string    `json:"ref"`
	Status    string    `json:"status"` // success, failed, running, pending
	WebURL    string    `json:"web_url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Duration  int       `json:"duration"` // seconds
}

// Issue represents a GitLab issue
type Issue struct {
	ID        int       `json:"id"`
	IID       int       `json:"iid"`
	Title     string    `json:"title"`
	State     string    `json:"state"`
	Labels    []string  `json:"labels"`
	Assignees []User    `json:"assignees"`
	Author    User      `json:"author"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	WebURL    string    `json:"web_url"`
}

// MergeRequest represents a GitLab merge request
type MergeRequest struct {
	ID          int       `json:"id"`
	IID         int       `json:"iid"`
	Title       string    `json:"title"`
	State       string    `json:"state"`
	MergeStatus string    `json:"merge_status"`
	Author      User      `json:"author"`
	Assignees   []User    `json:"assignees"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	WebURL      string    `json:"web_url"`
}

// User represents a GitLab user
type User struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Name     string `json:"name"`
	Avatar   string `json:"avatar_url"`
}

// TestConnection tests the GitLab connection
func (g *GitLabIntegration) TestConnection(ctx context.Context) error {
	token := g.GetSecret("token")
	if token == "" {
		return fmt.Errorf("GitLab Token 未配置")
	}

	url := g.BuildURL("/api/v4/user")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("PRIVATE-TOKEN", token)

	resp, err := g.Client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to connect to GitLab: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusUnauthorized {
		return fmt.Errorf("authentication failed: invalid token")
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("GitLab returned status code %d", resp.StatusCode)
	}

	return nil
}

// GetProjects retrieves user's projects
func (g *GitLabIntegration) GetProjects(ctx context.Context, limit int) ([]Project, error) {
	token := g.GetSecret("token")
	url := g.BuildURL(fmt.Sprintf("/api/v4/projects?membership=true&per_page=%d&order_by=last_activity_at", limit))

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("PRIVATE-TOKEN", token)

	resp, err := g.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get projects: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitLab returned status code %d", resp.StatusCode)
	}

	var projects []Project
	if err := json.NewDecoder(resp.Body).Decode(&projects); err != nil {
		return nil, fmt.Errorf("failed to decode projects: %w", err)
	}

	return projects, nil
}

// GetPipelines retrieves recent pipelines for a project
func (g *GitLabIntegration) GetPipelines(ctx context.Context, projectID int, limit int) ([]Pipeline, error) {
	token := g.GetSecret("token")
	url := g.BuildURL(fmt.Sprintf("/api/v4/projects/%d/pipelines?per_page=%d", projectID, limit))

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("PRIVATE-TOKEN", token)

	resp, err := g.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get pipelines: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitLab returned status code %d", resp.StatusCode)
	}

	var pipelines []Pipeline
	if err := json.NewDecoder(resp.Body).Decode(&pipelines); err != nil {
		return nil, fmt.Errorf("failed to decode pipelines: %w", err)
	}

	return pipelines, nil
}
