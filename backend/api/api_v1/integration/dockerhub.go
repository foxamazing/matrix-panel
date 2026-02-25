package integration

import (
	"matrix-panel/lib/integration/dockerhub"
	"net/http"

	"github.com/gin-gonic/gin"
)

// DockerHubReposHandler handles Docker Hub repositories requests
func DockerHubReposHandler(c *gin.Context) {
	var req struct {
		Username string `json:"username" binding:"required"`
		Limit    int    `json:"limit"`
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

	client := dockerhub.NewDockerHubIntegration(req.Username)
	repos, err := client.GetRepositories(req.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to get repositories: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"repositories": repos,
	})
}

// DockerHubTestConnectionHandler tests Docker Hub connection
func DockerHubTestConnectionHandler(c *gin.Context) {
	username := c.Query("username")

	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "username parameter required",
		})
		return
	}

	client := dockerhub.NewDockerHubIntegration(username)
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
