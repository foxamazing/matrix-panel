package widget

import (
	"matrix-panel/api/api_v1/widget"

	"github.com/gin-gonic/gin"
)

// Init 初始化Widget路由
func Init(routerGroup *gin.RouterGroup) {
	// API v1
	api_v1 := routerGroup.Group("/v1")

	// 看板路由
	boards := api_v1.Group("/boards")
	{
		boards.GET("/default", widget.GetDefaultBoard)
		boards.GET("/:boardId/widgets", widget.GetBoardWidgets)
	}

	// Widget路由
	widgets := api_v1.Group("/widgets")
	{
		widgets.POST("", widget.CreateWidget)
		widgets.PUT("/:id", widget.UpdateWidget)
		widgets.DELETE("/:id", widget.DeleteWidget)
	}

	// Widget数据 API
	widgetData := api_v1.Group("/integrations")
	{
		// P1已实现的API
		widgetData.POST("/media-server/sessions", widget.GetMediaServerSessions)
		widgetData.POST("/sonarr/calendar", widget.GetSonarrCalendar)
		widgetData.POST("/download-client/queue", widget.GetDownloadQueue)
		widgetData.POST("/docker/containers", widget.GetDockerContainers)
		widgetData.POST("/health/status", widget.GetHealthStatus)

		// P1待实现
		// widgetData.POST("/radarr/calendar", widget.GetRadarrCalendar)
	}
}
