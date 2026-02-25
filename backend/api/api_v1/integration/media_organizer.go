package integration

import (
	"context"
	"matrix-panel/lib/integration/lidarr"
	"matrix-panel/lib/integration/prowlarr"
	"matrix-panel/lib/integration/radarr"
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	integration, err := getRadarrIntegration(req.IntegrationID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "集成不存在"})
		return
	}

	days := req.Days
	if days <= 0 {
		days = 30
	}
	start := time.Now()
	end := start.AddDate(0, 0, days)

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	events, err := integration.GetCalendar(ctx, start, end, req.IncludeUnmonitored)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": events})
}

// GetLidarrCalendar 获取Lidarr日历
func GetLidarrCalendar(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
		Days          int    `json:"days"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	integration, err := getLidarrIntegration(req.IntegrationID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "集成不存在"})
		return
	}

	days := req.Days
	if days <= 0 {
		days = 14
	}
	start := time.Now()
	end := start.AddDate(0, 0, days)

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	events, err := integration.GetCalendar(ctx, start, end)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": events})
}

// GetProwlarrIndexers 获取Prowlarr索引器
func GetProwlarrIndexers(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	integration, err := getProwlarrIntegration(req.IntegrationID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "集成不存在"})
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 30*time.Second)
	defer cancel()

	indexers, err := integration.GetIndexers(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": indexers})
}

// TODO: 实现数据库查询函数
func getRadarrIntegration(id string) (*radarr.RadarrIntegration, error) {
	return nil, nil
}

func getLidarrIntegration(id string) (*lidarr.LidarrIntegration, error) {
	return nil, nil
}

func getProwlarrIntegration(id string) (*prowlarr.ProwlarrIntegration, error) {
	return nil, nil
}
