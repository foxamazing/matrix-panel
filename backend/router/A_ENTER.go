package router

import (
	"matrix-panel/global"
	// "matrix-panel/router/admin"
	"matrix-panel/router/openness"
	"matrix-panel/router/panel"
	"matrix-panel/router/system"

	"github.com/gin-gonic/gin"
)

// 初始化总路由
func InitRouters(addr string) error {
	router := gin.Default()
	rootRouter := router.Group("/")
	routerGroup := rootRouter.Group("api")

	// 设置文件上传大小限制
	router.MaxMultipartMemory = 32 << 20 // 32MB

	// 接口
	system.Init(routerGroup)
	panel.Init(routerGroup)
	openness.Init(routerGroup)

	// WEB文件服务
	{
		webPath := "./web"
		router.StaticFile("/", webPath+"/index.html")
		router.Static("/Pixel", "./assets/Pixel")
		router.Static("/assets", webPath+"/assets")
		router.Static("/custom", webPath+"/custom")
		router.StaticFile("/favicon.ico", webPath+"/favicon.ico")
		router.StaticFile("/favicon.svg", webPath+"/favicon.svg")
	}

	// 上传的文件
	sourcePath := global.Config.GetValueString("base", "source_path")
	router.Static(sourcePath[1:], sourcePath)

	global.Logger.Info("matrix-panel is Started.  Listening and serving HTTP on ", addr)
	return router.Run(addr)
}
