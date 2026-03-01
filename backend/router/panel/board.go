package panel

import (
	"matrix-panel/api/api_v1/middleware"
	"matrix-panel/api/api_v1/panel"

	"github.com/gin-gonic/gin"
)

func InitBoardRouter(router *gin.RouterGroup) {
	boardApi := panel.BoardApi{}
	boardReadRouter := router.Group("board", middleware.LoginInterceptor)
	{
		boardReadRouter.POST("list", boardApi.GetBoardList)
		boardReadRouter.POST("detail/:id", boardApi.GetBoardDetail)
	}

	boardWriteRouter := router.Group("board", middleware.LoginInterceptor, middleware.AdminInterceptor)
	{
		boardWriteRouter.POST("create", boardApi.CreateBoard)
		boardWriteRouter.POST("update/:id", boardApi.UpdateBoard)
		boardWriteRouter.POST("delete/:id", boardApi.DeleteBoard)
		boardWriteRouter.POST("duplicate/:id", boardApi.DuplicateBoard)
	}
}
