package widget

import (
	"matrix-panel/db"
	"matrix-panel/lib/integration/portainer"
	"matrix-panel/lib/integration/qbittorrent"
	"matrix-panel/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetDownloadQueue 获取下载队列
func GetDownloadQueue(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
		Limit         int    `json:"limit"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	if req.Limit == 0 {
		req.Limit = 20
	}

	var integration models.Integration
	if err := db.DB.First(&integration, "id = ?", req.IntegrationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "集成不存在"})
		return
	}

	if integration.SecretMap == nil {
		integration.AfterFind()
	}
	secrets := integration.SecretMap
	if secrets == nil {
		secrets = make(map[string]string)
	}

	ctx := c.Request.Context()
	var torrents []interface{}

	switch integration.Kind {
	case "qbittorrent":
		id := strconv.FormatUint(uint64(integration.ID), 10)
		qb := qbittorrent.New(id, integration.Name, integration.URL, secrets)
		qbTorrents, err := qb.GetTorrents(ctx)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "获取队列失败: " + err.Error()})
			return
		}
		// 转换为interface{}数组
		for _, t := range qbTorrents {
			torrents = append(torrents, t)
		}

	case "transmission", "deluge":
		// 暂时返回空数组
		torrents = []interface{}{}

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "不支持的下载客户端: " + integration.Kind})
		return
	}

	if len(torrents) > req.Limit {
		torrents = torrents[:req.Limit]
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    torrents,
	})
}

// GetDockerContainers 获取Docker容器列表
func GetDockerContainers(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
		Limit         int    `json:"limit"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	if req.Limit == 0 {
		req.Limit = 50
	}

	var integration models.Integration
	if err := db.DB.First(&integration, "id = ?", req.IntegrationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "集成不存在"})
		return
	}

	if integration.SecretMap == nil {
		integration.AfterFind()
	}
	secrets := integration.SecretMap
	if secrets == nil {
		secrets = make(map[string]string)
	}

	ctx := c.Request.Context()
	var containers []interface{}

	switch integration.Kind {
	case "portainer":
		id := strconv.FormatUint(uint64(integration.ID), 10)
		portainerInteg := portainer.New(id, integration.Name, integration.URL, secrets)
		portainerContainers, err := portainerInteg.GetContainers(ctx)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "获取容器失败: " + err.Error()})
			return
		}
		for _, cont := range portainerContainers {
			containers = append(containers, cont)
		}

	case "docker":
		// 直接Docker API暂不实现
		containers = []interface{}{}

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "不支持的Docker管理类型: " + integration.Kind})
		return
	}

	if len(containers) > req.Limit {
		containers = containers[:req.Limit]
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    containers,
	})
}

// GetHealthStatus 获取系统健康状态
// POST /api/integrations/health/status
func GetHealthStatus(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	// 查询集成配置
	idInt, _ := strconv.Atoi(req.IntegrationID)
	var integration models.Integration
	if err := db.DB.First(&integration, "id = ?", idInt).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "集成不存在"})
		return
	}

	// 临时返回模拟健康数据
	healthData := map[string]interface{}{
		"cpu": map[string]interface{}{
			"usage":       45.5,
			"temperature": 55,
		},
		"memory": map[string]interface{}{
			"used":       8589934592,
			"total":      17179869184,
			"percentage": 50,
		},
		"disk": map[string]interface{}{
			"used":       500000000000,
			"total":      1000000000000,
			"percentage": 50,
		},
		"network": map[string]interface{}{
			"rx": 1024000,
			"tx": 512000,
		},
		"status": "healthy",
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    healthData,
	})
}
