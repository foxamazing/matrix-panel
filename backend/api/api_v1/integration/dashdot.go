package integration

import (
	"matrix-panel/lib/integration/dashdot"
	"net/http"

	"github.com/gin-gonic/gin"
)

// DashdotStatsHandler handles Dashdot stats requests
func DashdotStatsHandler(c *gin.Context) {
	var req struct {
		URL string `json:"url" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request: " + err.Error(),
		})
		return
	}

	// Create Dashdot client
	client := dashdot.NewDashdotIntegration(req.URL)

	// Get stats
	stats, err := client.GetStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to get Dashdot stats: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"stats":   stats,
	})
}

// DashdotTestConnectionHandler tests Dashdot connection
func DashdotTestConnectionHandler(c *gin.Context) {
	var req struct {
		URL string `json:"url" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request: " + err.Error(),
		})
		return
	}

	client := dashdot.NewDashdotIntegration(req.URL)
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
