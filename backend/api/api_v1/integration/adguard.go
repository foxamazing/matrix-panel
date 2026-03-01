package integration

import (
	"context"
	"fmt"
	"matrix-panel/db"
	"matrix-panel/lib/integration/adguard"
	"matrix-panel/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// AdGuardStatsHandler 获取 AdGuard Home 统计数据
func AdGuardStatsHandler(c *gin.Context) {
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

	a := adguard.New(fmt.Sprintf("%d", integration.ID), integration.Name, integration.URL, integration.SecretMap)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	stats, err := a.GetDNSStats(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    stats,
	})
}

// AdGuardControlHandler 控制 AdGuard Home 过滤状态
func AdGuardControlHandler(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
		Enable        bool   `json:"enable"`
		Duration      int    `json:"duration"` // 禁用时长 (秒)
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

	a := adguard.New(fmt.Sprintf("%d", integration.ID), integration.Name, integration.URL, integration.SecretMap)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var err error
	if req.Enable {
		err = a.EnableFiltering(ctx)
	} else {
		err = a.DisableFiltering(ctx, req.Duration)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "状态更新成功"})
}

// AdGuardTestConnectionHandler 测试 AdGuard Home 连接
func AdGuardTestConnectionHandler(c *gin.Context) {
	var req struct {
		URL     string            `json:"url" binding:"required"`
		Secrets map[string]string `json:"secrets"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	a := adguard.New("", "Test", req.URL, req.Secrets)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := a.TestConnection(ctx); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "连接成功"})
}
