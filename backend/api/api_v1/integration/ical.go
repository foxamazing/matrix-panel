package integration

import (
	"matrix-panel/lib/integration/ical"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ICalEventsHandler handles iCal events requests
func ICalEventsHandler(c *gin.Context) {
	var req struct {
		FeedURL string `json:"feedUrl" binding:"required"`
		Limit   int    `json:"limit"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request: " + err.Error(),
		})
		return
	}

	if req.Limit == 0 {
		req.Limit = 10
	}

	client := ical.NewICalIntegration(req.FeedURL)
	events, err := client.GetUpcomingEvents(req.Limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to get events: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"events":  events,
	})
}

// ICalTestConnectionHandler tests iCal feed connection
func ICalTestConnectionHandler(c *gin.Context) {
	feedURL := c.Query("feedUrl")
	if feedURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "feedUrl parameter required",
		})
		return
	}

	client := ical.NewICalIntegration(feedURL)
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
