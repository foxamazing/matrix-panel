package widget

import (
	"matrix-panel/db"
	"matrix-panel/lib/integration"
	"matrix-panel/lib/integration/plex"
	"matrix-panel/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetMediaServerSessions 获取媒体服务器播放会话
func GetMediaServerSessions(c *gin.Context) {
	var req struct {
		IntegrationID string `json:"integrationId" binding:"required"`
		Limit         int    `json:"limit"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	if req.Limit == 0 {
		req.Limit = 10
	}

	var integrationModel models.Integration
	if err := db.DB.First(&integrationModel, "id = ?", req.IntegrationID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "集成不存在"})
		return
	}

	if integrationModel.SecretMap == nil {
		integrationModel.AfterFind()
	}
	secrets := integrationModel.SecretMap
	if secrets == nil {
		secrets = make(map[string]string)
	}

	var sessions []Session
	ctx := c.Request.Context()

	switch integrationModel.Kind {
	case "plex":
		id := strconv.FormatUint(uint64(integrationModel.ID), 10)
		plexIntegration := plex.New(id, integrationModel.Name, integrationModel.URL, secrets)
		plexSessions, err := plexIntegration.GetCurrentSessions(ctx, req.Limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "获取Plex会话失败: " + err.Error()})
			return
		}
		sessions = convertPlexSessions(plexSessions)

	case "jellyfin":
		sessions = []Session{}

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "不支持的集成类型: " + integrationModel.Kind})
		return
	}

	if len(sessions) > req.Limit {
		sessions = sessions[:req.Limit]
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"sessions": sessions,
	})
}

type Session struct {
	SessionID  string `json:"sessionId"`
	Username   string `json:"username"`
	ItemName   string `json:"itemName"`
	ItemType   string `json:"itemType"`
	DeviceName string `json:"deviceName,omitempty"`
	IsPaused   bool   `json:"isPaused"`
	Progress   int    `json:"progress,omitempty"`
	Duration   int    `json:"duration,omitempty"`
	PosterURL  string `json:"posterUrl,omitempty"`
}

func convertPlexSessions(plexSessions []integration.StreamSession) []Session {
	sessions := make([]Session, 0, len(plexSessions))
	for _, ps := range plexSessions {
		sessions = append(sessions, Session{
			SessionID:  ps.SessionID,
			Username:   ps.Username,
			ItemName:   ps.ItemName,
			ItemType:   ps.ItemType,
			DeviceName: ps.DeviceName,
			IsPaused:   ps.IsPaused,
			Progress:   ps.Progress,
			Duration:   ps.Duration,
			PosterURL:  "",
		})
	}
	return sessions
}
