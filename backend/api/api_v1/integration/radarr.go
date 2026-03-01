package integration

import (
	"context"
	"fmt"
	"matrix-panel/db"
	"matrix-panel/lib/integration/radarr"
	"matrix-panel/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// GetRadarrCalendar 获取Radarr日历
func GetRadarrCalendar(c *gin.Context) {
	var req struct {
		IntegrationID      string `json:"integrationId" binding:"required"`
		Days               int    `json:"days"`
		IncludeUnmonitored bool   `json:"includeUnmonitored"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "参数错误: " + err.Error()})
		return
	}

	integration, err := getRadarrIntegration(req.IntegrationID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "集成不存在"})
		return
	}

	days := req.Days
	if days <= 0 {
		days = 7
	}
	start := time.Now()
	end := start.AddDate(0, 0, days)

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	events, err := integration.GetCalendar(ctx, start, end, req.IncludeUnmonitored)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "获取日历失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": events})
}

// GetRadarrMovies 获取Radarr电影列表
func GetRadarrMovies(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "参数错误: " + err.Error()})
		return
	}

	integration, err := getRadarrIntegration(req.IntegrationID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "集成不存在"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	movies, err := integration.GetMovies(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "获取电影失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": movies})
}

// GetRadarrQueue 获取Radarr下载队列
func GetRadarrQueue(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "参数错误: " + err.Error()})
		return
	}

	integration, err := getRadarrIntegration(req.IntegrationID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "集成不存在"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	queue, err := integration.GetQueue(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "获取队列失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": queue})
}

// RadarrTestConnectionHandler 测试 Radarr 连接
func RadarrTestConnectionHandler(c *gin.Context) {
	var req struct {
		URL     string            `json:"url" binding:"required"`
		Secrets map[string]string `json:"secrets"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	r := radarr.New("", "Test", req.URL, req.Secrets)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := r.TestConnection(ctx); err != nil {
		c.JSON(http.StatusOK, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "连接成功"})
}

func getRadarrIntegration(id string) (*radarr.RadarrIntegration, error) {
	var integration models.Integration
	if err := db.DB.First(&integration, "id = ?", id).Error; err != nil {
		return nil, err
	}
	integration.AfterFind()

	return radarr.New(fmt.Sprintf("%d", integration.ID), integration.Name, integration.URL, integration.SecretMap), nil
}
