package widget

import (
	"matrix-panel/db"
	"matrix-panel/lib/integration/sonarr"
	"matrix-panel/models"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// GetSonarrCalendar 获取Sonarr日历
func GetSonarrCalendar(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
		Days          int    `json:"days"` // 未来几天,默认7天
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	if req.Days == 0 {
		req.Days = 7
	}

	// 查询集成配置
	var integration models.Integration
	if err := db.DB.First(&integration, "id = ?", req.IntegrationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "集成不存在"})
		return
	}

	if integration.Kind != "sonarr" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不是Sonarr集成"})
		return
	}

	// 获取密钥
	if integration.SecretMap == nil {
		integration.AfterFind()
	}
	secrets := integration.SecretMap
	if secrets == nil {
		secrets = make(map[string]string)
	}

	// 创建Sonarr集成实例
	id := strconv.FormatUint(uint64(integration.ID), 10)
	sonarrIntegration := sonarr.New(id, integration.Name, integration.URL, secrets)

	// 获取日历数据
	start := time.Now()
	end := start.AddDate(0, 0, req.Days)
	ctx := c.Request.Context()

	calendar, err := sonarrIntegration.GetCalendar(ctx, start, end, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取日历失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    calendar,
	})
}

// GetRadarrCalendar 获取Radarr日历
// POST /api/integrations/radarr/calendar
func GetRadarrCalendar(c *gin.Context) {
	// 与Sonarr类似,调用radarr集成
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    []interface{}{},
		"message": "Radarr calendar - 待实现",
	})
}
