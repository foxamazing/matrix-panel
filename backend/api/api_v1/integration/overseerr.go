package integration

import (
	"context"
	"fmt"
	"matrix-panel/db"
	"matrix-panel/lib/integration/overseerr"
	"matrix-panel/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// OverseerrRequestsHandler 获取 Overseerr 请求列表
func OverseerrRequestsHandler(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
		Limit         int    `json:"limit"`
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

	o := overseerr.New(fmt.Sprintf("%d", integration.ID), integration.Name, integration.URL, integration.SecretMap)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	requests, err := o.GetRequests(ctx, req.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    requests,
	})
}

// OverseerrStatsHandler 获取 Overseerr 请求统计
func OverseerrStatsHandler(c *gin.Context) {
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

	o := overseerr.New(fmt.Sprintf("%d", integration.ID), integration.Name, integration.URL, integration.SecretMap)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	stats, err := o.GetRequestCount(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    stats,
	})
}

// OverseerrTestConnectionHandler 测试 Overseerr 连接
func OverseerrTestConnectionHandler(c *gin.Context) {
	var req struct {
		URL     string            `json:"url" binding:"required"`
		Secrets map[string]string `json:"secrets"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	o := overseerr.New("", "Test", req.URL, req.Secrets)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := o.TestConnection(ctx); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "连接成功"})
}
