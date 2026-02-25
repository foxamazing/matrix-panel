package integration

import (
	"matrix-panel/lib/integration/gitlab"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GitLabProjectsHandler handles GitLab projects requests
func GitLabProjectsHandler(c *gin.Context) {
	var req struct {
		BaseURL string `json:"baseUrl"`
		Token   string `json:"token" binding:"required"`
		Limit   int    `json:"limit"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request: " + err.Error(),
		})
		return
	}

	if req.Limit == 0 {
		req.Limit = 10
	}

	client := gitlab.NewGitLabIntegration(req.BaseURL, req.Token)
	projects, err := client.GetProjects(req.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to get projects: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"projects": projects,
	})
}

// GitLabPipelinesHandler handles GitLab pipelines requests
func GitLabPipelinesHandler(c *gin.Context) {
	var req struct {
		BaseURL   string `json:"baseUrl"`
		Token     string `json:"token" binding:"required"`
		ProjectID int    `json:"projectId" binding:"required"`
		Limit     int    `json:"limit"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request: " + err.Error(),
		})
		return
	}

	if req.Limit == 0 {
		req.Limit = 10
	}

	client := gitlab.NewGitLabIntegration(req.BaseURL, req.Token)
	pipelines, err := client.GetPipelines(req.ProjectID, req.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to get pipelines: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"pipelines": pipelines,
	})
}

// GitLabTestConnectionHandler tests GitLab connection
func GitLabTestConnectionHandler(c *gin.Context) {
	baseURL := c.Query("baseUrl")
	token := c.Query("token")

	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "token parameter required",
		})
		return
	}

	client := gitlab.NewGitLabIntegration(baseURL, token)
	if err := client.TestConnection(); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Connection successful",
	})
}
