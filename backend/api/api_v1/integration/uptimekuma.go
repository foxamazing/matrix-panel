package integration

import (
	"matrix-panel/lib/integration/uptimekuma"
	"net/http"

	"github.com/gin-gonic/gin"
)

// UptimeKumaMonitorsHandler handles Uptime Kuma monitors requests
func UptimeKumaMonitorsHandler(c *gin.Context) {
	var req struct {
		BaseURL string `json:"baseUrl" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request: " + err.Error(),
		})
		return
	}

	client := uptimekuma.NewUptimeKumaIntegration(req.BaseURL)
	monitors, err := client.GetMonitors()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to get monitors: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"monitors": monitors,
	})
}

// UptimeKumaTestConnectionHandler tests Uptime Kuma connection
func UptimeKumaTestConnectionHandler(c *gin.Context) {
	baseURL := c.Query("baseUrl")

	if baseURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "baseUrl parameter required",
		})
		return
	}

	client := uptimekuma.NewUptimeKumaIntegration(baseURL)
	if err := client.TestConnection(); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Connection successful",
	})
}
