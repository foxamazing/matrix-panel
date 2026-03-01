package integration

import (
	"context"
	"fmt"
	"matrix-panel/db"
	"matrix-panel/lib/integration/prowlarr"
	"matrix-panel/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// GetProwlarrIndexers 获取 Prowlarr 索引器列表
func GetProwlarrIndexers(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "参数错误: " + err.Error()})
		return
	}

	integration, err := getProwlarrIntegration(req.IntegrationID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "集成不存在"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	indexers, err := integration.GetIndexers(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "获取索引器失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": indexers})
}

// GetProwlarrStats 获取 Prowlarr 索引统计
func GetProwlarrStats(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "参数错误: " + err.Error()})
		return
	}

	integration, err := getProwlarrIntegration(req.IntegrationID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "集成不存在"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	stats, err := integration.GetIndexerStats(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "获取统计失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": stats})
}

// ProwlarrTestConnectionHandler 测试 Prowlarr 连接
func ProwlarrTestConnectionHandler(c *gin.Context) {
	var req struct {
		URL     string            `json:"url" binding:"required"`
		Secrets map[string]string `json:"secrets"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	p := prowlarr.New("", "Test", req.URL, req.Secrets)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := p.TestConnection(ctx); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "连接成功"})
}

func getProwlarrIntegration(id string) (*prowlarr.ProwlarrIntegration, error) {
	var integration models.Integration
	if err := db.DB.First(&integration, "id = ?", id).Error; err != nil {
		return nil, err
	}
	integration.AfterFind()

	return prowlarr.New(fmt.Sprintf("%d", integration.ID), integration.Name, integration.URL, integration.SecretMap), nil
}
