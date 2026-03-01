package integration

import (
	"context"
	"fmt"
	"matrix-panel/db"
	"matrix-panel/lib/integration/aria2"
	"matrix-panel/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Aria2TorrentsHandler 获取 Aria2 下载列表
func Aria2TorrentsHandler(c *gin.Context) {
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

	a := aria2.New(fmt.Sprintf("%d", integration.ID), integration.Name, integration.URL, integration.SecretMap)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	torrents, err := a.GetTorrents(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    torrents,
	})
}

// Aria2StatusHandler 获取 Aria2 全局统计
func Aria2StatusHandler(c *gin.Context) {
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

	a := aria2.New(fmt.Sprintf("%d", integration.ID), integration.Name, integration.URL, integration.SecretMap)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	status, err := a.GetStatus(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    status,
	})
}

// Aria2ControlHandler 控制 Aria2 任务 (pause, resume)
func Aria2ControlHandler(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
		Hash          string `json:"hash" binding:"required"`   // Aria2 使用 GID
		Action        string `json:"action" binding:"required"` // pause, resume
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

	a := aria2.New(fmt.Sprintf("%d", integration.ID), integration.Name, integration.URL, integration.SecretMap)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var err error
	switch req.Action {
	case "pause":
		err = a.PauseTorrent(ctx, req.Hash)
	case "resume":
		err = a.ResumeTorrent(ctx, req.Hash)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "无效的操作类型"})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "操作执行成功"})
}

// Aria2TestConnectionHandler 测试 Aria2 连接
func Aria2TestConnectionHandler(c *gin.Context) {
	var req struct {
		URL     string            `json:"url" binding:"required"`
		Secrets map[string]string `json:"secrets"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	a := aria2.New("", "Test", req.URL, req.Secrets)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := a.TestConnection(ctx); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "连接成功"})
}
