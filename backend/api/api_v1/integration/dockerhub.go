package integration

import (
	"context"
	"fmt"
	"matrix-panel/db"
	"matrix-panel/lib/integration/dockerhub"
	"matrix-panel/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// GetDockerHubRepositories 获取 Docker Hub 仓库列表
func GetDockerHubRepositories(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
		Limit         int    `json:"limit"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "参数错误: " + err.Error()})
		return
	}

	if req.Limit <= 0 {
		req.Limit = 10
	}

	integration, err := getDockerHubIntegration(req.IntegrationID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "集成不存在"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	repos, err := integration.GetRepositories(ctx, req.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": repos})
}

// DockerHubTestConnectionHandler 测试 Docker Hub 连接
func DockerHubTestConnectionHandler(c *gin.Context) {
	var req struct {
		URL     string            `json:"url" binding:"required"`
		Secrets map[string]string `json:"secrets"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	d := dockerhub.New("", "Test", req.URL, req.Secrets)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := d.TestConnection(ctx); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "连接成功"})
}

func getDockerHubIntegration(id string) (*dockerhub.DockerHubIntegration, error) {
	var integration models.Integration
	if err := db.DB.First(&integration, "id = ?", id).Error; err != nil {
		return nil, err
	}
	integration.AfterFind()

	return dockerhub.New(fmt.Sprintf("%d", integration.ID), integration.Name, integration.URL, integration.SecretMap), nil
}
