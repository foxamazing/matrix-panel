package system

import (
	"matrix-panel/api/api_v1"
	"matrix-panel/api/api_v1/middleware"

	"github.com/gin-gonic/gin"
)

func InitMonitorRouter(router *gin.RouterGroup) {
	api := api_v1.ApiGroupApp.ApiSystem.MonitorApi
	r := router.Group("", middleware.LoginInterceptor)
	r.POST("/system/monitor/fetchFavicon", api.FetchFavicon)
	r.POST("/system/monitor/getAll", api.GetAll)
	r.POST("/system/monitor/getCpuState", api.GetCpuState)
	r.POST("/system/monitor/getGpuState", api.GetGpuState)
	r.POST("/system/monitor/getDiskMountpoints", api.GetDiskMountpoints)
	r.POST("/system/monitor/getDiskStateAll", api.GetDiskStateAll)
	r.POST("/system/monitor/getDiskStateByPath", api.GetDiskStateByPath)
	r.POST("/system/monitor/getMemonyState", api.GetMemonyState)
	r.POST("/system/monitor/getNetIOState", api.GetNetIOState)
	r.POST("/system/monitor/getPowerState", api.GetPowerState)

	rAdmin := router.Group("", middleware.LoginInterceptor, middleware.AdminInterceptor)
	rAdmin.POST("/system/monitor/getDockerState", api.GetDockerState)
	rAdmin.POST("/system/monitor/getEmbyCovers", api.GetEmbyCovers)
	rAdmin.POST("/system/monitor/docker/start", api.DockerStart)
	rAdmin.POST("/system/monitor/docker/stop", api.DockerStop)
	rAdmin.POST("/system/monitor/docker/restart", api.DockerRestart)
}
