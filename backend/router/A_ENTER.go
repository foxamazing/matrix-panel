package router

import (
	"matrix-panel/global"
	"matrix-panel/router/integration"
	"matrix-panel/router/openness"
	"matrix-panel/router/panel"
	"matrix-panel/router/system"
	"matrix-panel/router/widget"

	"github.com/gin-gonic/gin"
)

// InitRouters initializes all HTTP routes and starts the server.
func InitRouters(addr string) error {
	router := gin.Default()
	rootRouter := router.Group("/")
	routerGroup := rootRouter.Group("api")

	// File upload limit: 32MB
	router.MaxMultipartMemory = 32 << 20

	// API routers
	system.Init(routerGroup)
	panel.Init(routerGroup)
	integration.Init(routerGroup)
	widget.Init(routerGroup)
	openness.Init(routerGroup)

	// Static web assets
	{
		webPath := "./web"
		router.StaticFile("/", webPath+"/index.html")
		router.Static("/Pixel", "./assets/Pixel")
		router.Static("/assets", webPath+"/assets")
		router.Static("/custom", webPath+"/custom")
		router.StaticFile("/favicon.ico", webPath+"/favicon.ico")
		router.StaticFile("/favicon.svg", webPath+"/favicon.svg")
	}

	// Uploaded files
	sourcePath := global.Config.GetValueString("base", "source_path")
	router.Static(sourcePath[1:], sourcePath)

	global.Logger.Info("matrix-panel is Started.  Listening and serving HTTP on ", addr)
	return router.Run(addr)
}
