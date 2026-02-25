package gitlab

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// GitLabIntegration represents a GitLab integration
type GitLabIntegration struct {
	BaseURL string
	Token   string
	client  *http.Client
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

// NewGitLabIntegration creates a new GitLab integration
func NewGitLabIntegration(baseURL, token string) *GitLabIntegration {
	if baseURL == "" {
		baseURL = "https://gitlab.com"
	}
	return &GitLabIntegration{
		BaseURL: baseURL,
		Token:   token,
		client: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

// TestConnection tests the GitLab connection
func (g *GitLabIntegration) TestConnection() error {
	req, err := http.NewRequest("GET", fmt.Sprintf("%s/api/v4/user", g.BaseURL), nil)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("PRIVATE-TOKEN", g.Token)

	resp, err := g.client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to connect to GitLab: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == 401 {
		return fmt.Errorf("authentication failed: invalid token")
	}

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("GitLab returned status code %d", resp.StatusCode)
	}

	return nil
}

// GetProjects retrieves user's projects
func (g *GitLabIntegration) GetProjects(limit int) ([]Project, error) {
	url := fmt.Sprintf("%s/api/v4/projects?membership=true&per_page=%d&order_by=last_activity_at",
		g.BaseURL, limit)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("PRIVATE-TOKEN", g.Token)

	resp, err := g.client.Do(req)
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
func (g *GitLabIntegration) GetPipelines(projectID int, limit int) ([]Pipeline, error) {
	url := fmt.Sprintf("%s/api/v4/projects/%d/pipelines?per_page=%d",
		g.BaseURL, projectID, limit)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("PRIVATE-TOKEN", g.Token)

	resp, err := g.client.Do(req)
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

// GetIssues retrieves open issues for a project
func (g *GitLabIntegration) GetIssues(projectID int, limit int) ([]Issue, error) {
	url := fmt.Sprintf("%s/api/v4/projects/%d/issues?state=opened&per_page=%d",
		g.BaseURL, projectID, limit)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("PRIVATE-TOKEN", g.Token)

	resp, err := g.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get issues: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitLab returned status code %d", resp.StatusCode)
	}

	var issues []Issue
	if err := json.NewDecoder(resp.Body).Decode(&issues); err != nil {
		return nil, fmt.Errorf("failed to decode issues: %w", err)
	}

	return issues, nil
}

// GetMergeRequests retrieves open merge requests for a project
func (g *GitLabIntegration) GetMergeRequests(projectID int, limit int) ([]MergeRequest, error) {
	url := fmt.Sprintf("%s/api/v4/projects/%d/merge_requests?state=opened&per_page=%d",
		g.BaseURL, projectID, limit)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("PRIVATE-TOKEN", g.Token)

	resp, err := g.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get merge requests: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("GitLab returned status code %d", resp.StatusCode)
	}

	var mrs []MergeRequest
	if err := json.NewDecoder(resp.Body).Decode(&mrs); err != nil {
		return nil, fmt.Errorf("failed to decode merge requests: %w", err)
	}

	return mrs, nil
}
