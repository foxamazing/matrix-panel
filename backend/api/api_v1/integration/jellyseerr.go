package integration

import (
	"context"
	"fmt"
	"matrix-panel/db"
	"matrix-panel/lib/integration/jellyseerr"
	"matrix-panel/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// JellyseerrRequestsHandler 获取 Jellyseerr 请求列表
func JellyseerrRequestsHandler(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	var integration models.Integration
	if err := db.DB.First(&integration, "id = ?", req.IntegrationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "集成配置不存在"})
		return
	}
	integration.AfterFind()

	j := jellyseerr.New(fmt.Sprintf("%d", integration.ID), integration.Name, integration.URL, integration.SecretMap)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	requests, err := j.GetRequests(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    requests,
	})
}

// JellyseerrTestConnectionHandler 测试 Jellyseerr 连接
func JellyseerrTestConnectionHandler(c *gin.Context) {
	var req struct {
		URL     string            `json:"url" binding:"required"`
		Secrets map[string]string `json:"secrets"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	j := jellyseerr.New("", "Test", req.URL, req.Secrets)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := j.TestConnection(ctx); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "连接成功"})
}
