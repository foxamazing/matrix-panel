package integration

import (
	"context"
	"matrix-panel/lib/integration/sonarr"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// GetSonarrCalendar 获取Sonarr日历
func GetSonarrCalendar(c *gin.Context) {
	var req struct {
		IntegrationID      string `json:"integrationId" binding:"required"`
		Days               int    `json:"days"`
		IncludeUnmonitored bool   `json:"includeUnmonitored"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	// 从数据库获取集成配置
	integration, err := getSonarrIntegration(req.IntegrationID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "集成不存在"})
		return
	}

	// 计算时间范围
	days := req.Days
	if days <= 0 {
		days = 7 // 默认7天
	}
	start := time.Now()
	end := start.AddDate(0, 0, days)

	// 调用集成方法
	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	events, err := integration.GetCalendar(ctx, start, end, req.IncludeUnmonitored)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取日历失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    events,
	})
}

// GetSonarrSeries 获取Sonarr剧集列表
func GetSonarrSeries(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	integration, err := getSonarrIntegration(req.IntegrationID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "集成不存在"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	series, err := integration.GetSeries(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取剧集失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    series,
	})
}

// GetSonarrQueue 获取Sonarr下载队列
func GetSonarrQueue(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	integration, err := getSonarrIntegration(req.IntegrationID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "集成不存在"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	queue, err := integration.GetQueue(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取队列失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    queue,
	})
}

// SearchSonarrSeries 搜索Sonarr剧集
func SearchSonarrSeries(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
		Query         string `json:"query" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	integration, err := getSonarrIntegration(req.IntegrationID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "集成不存在"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	results, err := integration.SearchSeries(ctx, req.Query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "搜索失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    results,
	})
}

// getSonarrIntegration 从数据库获取Sonarr集成
func getSonarrIntegration(id string) (*sonarr.SonarrIntegration, error) {
	// TODO: 从数据库查询集成配置
	// 这里需要实现数据库查询逻辑
	// 临时返回示例,实际应从数据库获取

	// 示例实现:
	// var integration models.Integration
	// if err := global.Database.First(&integration, "id = ?", id).Error; err != nil {
	//     return nil, err
	// }
	//
	// return sonarr.New(
	//     integration.ID,
	//     integration.Name,
	//     integration.URL,
	//     integration.SecretMap,
	// ), nil

	return nil, nil // 需要实现
}
