package integration

import (
	api "matrix-panel/api/api_v1/integration"

	"github.com/gin-gonic/gin"
)

func Init(router *gin.RouterGroup) {
	integrationRouter := router.Group("integrations")
	{
		// 集成配置管理API (CRUD)
		integrationRouter.GET("", api.GetIntegrations)
		integrationRouter.POST("", api.CreateIntegration)
		integrationRouter.GET("/:id", api.GetIntegration)
		integrationRouter.PUT("/:id", api.UpdateIntegration)
		integrationRouter.DELETE("/:id", api.DeleteIntegration)
		integrationRouter.POST("/test", api.TestIntegration)

		// Dashdot 集成端点
		integrationRouter.POST("/dashdot/stats", api.DashdotStatsHandler)
		integrationRouter.POST("/dashdot/test", api.DashdotTestConnectionHandler)

		// iCalendar 集成端点
		integrationRouter.POST("/ical/events", api.ICalEventsHandler)
		integrationRouter.GET("/ical/test", api.ICalTestConnectionHandler)

		// GitLab 集成端点
		integrationRouter.POST("/gitlab/projects", api.GitLabProjectsHandler)
		integrationRouter.POST("/gitlab/pipelines", api.GitLabPipelinesHandler)
		integrationRouter.GET("/gitlab/test", api.GitLabTestConnectionHandler)

		// Docker Hub 集成端点
		integrationRouter.POST("/dockerhub/repos", api.DockerHubReposHandler)
		integrationRouter.GET("/dockerhub/test", api.DockerHubTestConnectionHandler)

		// Uptime Kuma 集成端点
		integrationRouter.POST("/uptimekuma/monitors", api.UptimeKumaMonitorsHandler)
		integrationRouter.GET("/uptimekuma/test", api.UptimeKumaTestConnectionHandler)
	}
}
