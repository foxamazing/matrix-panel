package integration

import (
	"context"
	"fmt"
	"matrix-panel/db"
	"matrix-panel/lib/integration/plex"
	"matrix-panel/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// PlexSessionsHandler 获取Plex当前播放会话
func PlexSessionsHandler(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	// 获取集成配置
	var integration models.Integration
	if err := db.DB.First(&integration, "id = ?", req.IntegrationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "集成配置不存在"})
		return
	}
	integration.AfterFind()

	// 创建Plex实例
	p := plex.New(fmt.Sprintf("%d", integration.ID), integration.Name, integration.URL, integration.SecretMap)

	// 获取会话
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	sessions, err := p.GetCurrentSessions(ctx, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    sessions,
	})
}

// PlexRecentlyAddedHandler 获取Plex最近添加
func PlexRecentlyAddedHandler(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
		Limit         int    `json:"limit"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	if req.Limit <= 0 {
		req.Limit = 10
	}

	// 获取集成配置
	var integration models.Integration
	if err := db.DB.First(&integration, "id = ?", req.IntegrationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "集成配置不存在"})
		return
	}
	integration.AfterFind()

	// 创建Plex实例
	p := plex.New(fmt.Sprintf("%d", integration.ID), integration.Name, integration.URL, integration.SecretMap)

	// 获取最近添加
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	items, err := p.GetRecentlyAdded(ctx, req.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    items,
	})
}

// PlexTestConnectionHandler 测试Plex连接
func PlexTestConnectionHandler(c *gin.Context) {
	var req struct {
		URL     string            `json:"url" binding:"required"`
		Secrets map[string]string `json:"secrets" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	p := plex.New("", "Test", req.URL, req.Secrets)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := p.TestConnection(ctx); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "连接成功"})
}
