package panel

import (
	"matrix-panel/api/api_v1/middleware"
	"matrix-panel/api/api_v1/panel"

	"github.com/gin-gonic/gin"
)

func InitInviteRouter(Router *gin.RouterGroup) {
	inviteApi := panel.InviteApi{}
	inviteAdminRouter := Router.Group("invite", middleware.LoginInterceptor, middleware.AdminInterceptor)
	{
		inviteAdminRouter.POST("list", inviteApi.GetList)
		inviteAdminRouter.POST("create", inviteApi.Create)
		inviteAdminRouter.POST("delete", inviteApi.Delete)
	}

	invitePublicRouter := Router.Group("invite", middleware.PublicModeInterceptor)
	{
		invitePublicRouter.GET("validate", inviteApi.Validate)
	}
}
