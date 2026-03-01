package middleware

import (
	"matrix-panel/api/api_v1/common/apiReturn"
	"matrix-panel/api/api_v1/common/base"
	"matrix-panel/global"
	"matrix-panel/lib/cmn/systemSetting"
	"matrix-panel/models"

	"github.com/gin-gonic/gin"
)

// 公开访问模式（访客模式）
// [有token将自动登录，无token/过期将使用公开账号，不可以与LoginInterceptor一起使用]
func PublicModeInterceptor(c *gin.Context) {

	// 获得token
	cToken := c.GetHeader("token")
	token := ""

	// 没有token信息视为未登录
	if cToken != "" {
		var ok bool
		token, ok = global.CUserToken.Get(cToken)
		if ok && token != "" {
			// 直接返回缓存的用户信息
			if userInfo, success := global.UserToken.Get(token); success {
				global.Logger.Debug("缓存的用户信息命中")
				c.Set("userInfo", userInfo)
				return
			} else {
				global.Logger.Debug("缓存未命中，准备查询数据库用户信息")
				mUser := models.User{}
				// 去库中查询是否存在该用户
				if info, err := mUser.GetUserInfoByToken(token); err == nil && info.Token != "" && info.ID != 0 {
					global.Logger.Debug("数据库查询用户", info.ID)
					// 通过 设置当前用户信息
					global.UserToken.SetDefault(info.Token, info)
					global.CUserToken.SetDefault(cToken, token)
					c.Set("userInfo", info)
					return
				} else {
					global.Logger.Debug("数据库查询用户失败")
				}
			}
		} else {
			global.Logger.Debug("token为空或者不OK")
		}
	}

	// 获取公开账号的信息
	var userId *uint
	if err := global.SystemSetting.GetValueByInterface(systemSetting.PANEL_PUBLIC_USER_ID, &userId); err == nil && userId != nil {
		userInfo := models.User{}
		if err := global.Db.First(&userInfo, "id=?", userId).Error; err != nil {
			apiReturn.ErrorCode(c, 1001, global.Lang.Get("login.err_token_expire"), nil)
			c.Abort()
			return
		}
		global.Logger.Debug("访客用户ID:", userInfo.ID)
		c.Set("userInfo", userInfo)
		c.Set(base.GIN_GET_VISIT_MODE, base.VISIT_MODE_PUBLIC)
		return
	} else {
		// 如果访客用户未配置，不中断请求，而是继续执行（API内部会处理空用户信息）
		c.Next()
		return
	}
}
