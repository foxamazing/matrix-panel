package integration

import (
	"context"
	"fmt"
	"matrix-panel/db"
	"matrix-panel/lib/integration/gitlab"
	"matrix-panel/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// GetGitLabProjects 获取 GitLab 项目列表
func GetGitLabProjects(c *gin.Context) {
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

	integration, err := getGitLabIntegration(req.IntegrationID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "集成不存在"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	projects, err := integration.GetProjects(ctx, req.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": projects})
}

// GetGitLabPipelines 获取 GitLab 流水线列表
func GetGitLabPipelines(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
		ProjectID     int    `json:"projectId" binding:"required"`
		Limit         int    `json:"limit"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "参数错误: " + err.Error()})
		return
	}

	if req.Limit <= 0 {
		req.Limit = 5
	}

	integration, err := getGitLabIntegration(req.IntegrationID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "集成不存在"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	pipelines, err := integration.GetPipelines(ctx, req.ProjectID, req.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": pipelines})
}

// GitLabTestConnectionHandler 测试 GitLab 连接
func GitLabTestConnectionHandler(c *gin.Context) {
	var req struct {
		URL     string            `json:"url" binding:"required"`
		Secrets map[string]string `json:"secrets"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	g := gitlab.New("", "Test", req.URL, req.Secrets)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := g.TestConnection(ctx); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "连接成功"})
}

func getGitLabIntegration(id string) (*gitlab.GitLabIntegration, error) {
	var integration models.Integration
	if err := db.DB.First(&integration, "id = ?", id).Error; err != nil {
		return nil, err
	}
	integration.AfterFind()

	return gitlab.New(fmt.Sprintf("%d", integration.ID), integration.Name, integration.URL, integration.SecretMap), nil
}
