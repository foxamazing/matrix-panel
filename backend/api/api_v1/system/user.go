package system

import (
	"matrix-panel/api/api_v1/common/apiData/systemApiStructs"
	"matrix-panel/api/api_v1/common/apiReturn"
	"matrix-panel/api/api_v1/common/base"
	"matrix-panel/db"
	"matrix-panel/global"
	"matrix-panel/initialize/database"
	"matrix-panel/lib/cmn"
	"matrix-panel/models"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"gorm.io/gorm"
)

type UserApi struct{}

func (a *UserApi) GetInfo(c *gin.Context) {
	userInfo, _ := base.GetCurrentUserInfo(c)
	apiReturn.SuccessData(c, gin.H{
		"userId":    userInfo.ID,
		"id":        userInfo.ID,
		"headImage": userInfo.HeadImage,
		"name":      userInfo.Name,
		"role":      userInfo.Role,
	})
}

func (a *UserApi) GetAuthInfo(c *gin.Context) {
	userInfo, _ := base.GetCurrentUserInfo(c)
	visitMode := base.GetCurrentVisitMode(c)
	user := models.User{}
	user.ID = userInfo.ID
	user.HeadImage = userInfo.HeadImage
	user.Name = userInfo.Name
	user.Role = userInfo.Role
	user.Username = userInfo.Username
	apiReturn.SuccessData(c, gin.H{
		"user":      user,
		"visitMode": visitMode,
	})
}

func (a *UserApi) UpdateInfo(c *gin.Context) {
	userInfo, _ := base.GetCurrentUserInfo(c)
	type UpdateUserInfoStruct struct {
		HeadImage string `json:"headImage"`
		Name      string `json:"name" validate:"max=15,min=3,required"`
	}
	params := UpdateUserInfoStruct{}

	err := c.ShouldBindBodyWith(&params, binding.JSON)
	if err != nil {
		apiReturn.ErrorParamFomat(c, err.Error())
		return
	}

	if errMsg, err := base.ValidateInputStruct(&params); err != nil {
		apiReturn.ErrorParamFomat(c, errMsg)
		return
	}

	mUser := models.User{}
	err = mUser.UpdateUserInfoByUserId(userInfo.ID, map[string]interface{}{
		"head_image": params.HeadImage,
		"name":       params.Name,
	})
	global.UserToken.Delete(userInfo.Token)
	if err != nil {
		apiReturn.ErrorDatabase(c, err.Error())
	}
	apiReturn.Success(c)
}

func (a *UserApi) UpdatePasssword(c *gin.Context) {
	type UpdatePasssStruct struct {
		OldPassword string `json:"oldPassword"`
		NewPassword string `json:"newPassword"`
	}

	params := UpdatePasssStruct{}

	err := c.ShouldBindBodyWith(&params, binding.JSON)
	if err != nil {
		apiReturn.ErrorParamFomat(c, err.Error())
		return
	}
	userInfo, _ := base.GetCurrentUserInfo(c)
	mUser := models.User{}
	if v, err := mUser.GetUserInfoByUid(userInfo.ID); err != nil {
		apiReturn.ErrorParamFomat(c, err.Error())
		return
	} else {
		if !cmn.VerifyPassword(v.Password, params.OldPassword) {
			apiReturn.ErrorByCode(c, 1007)
			return
		}
	}
	res := global.Db.Model(&models.User{}).Where("id", userInfo.ID).Updates(map[string]interface{}{
		"password": cmn.PasswordEncryption(params.NewPassword),
		"token":    "",
	})
	if res.Error != nil {
		apiReturn.ErrorDatabase(c, res.Error.Error())
		return
	}
	global.UserToken.Delete(userInfo.Token)
	apiReturn.Success(c)
}

func (a *UserApi) GetReferralCode(c *gin.Context) {
	currentUserInfo, _ := base.GetCurrentUserInfo(c)
	mUser := models.User{}
	userInfo, err := mUser.GetUserInfoByUid(currentUserInfo.ID)
	if err != nil {
		apiReturn.ErrorDatabase(c, err.Error())
		return
	}

	if userInfo.ReferralCode == "" {
		for {
			referralCode := cmn.BuildRandCode(8, cmn.RAND_CODE_MODE2)
			global.Logger.Debug("referralCode:", referralCode)

			if row := global.Db.Find(&userInfo, "referral_code=?", referralCode).RowsAffected; row != 0 {
				continue
			}

			if err := global.Db.Model(&models.User{}).Where("id=?", userInfo.ID).Update("referral_code", referralCode).Error; err != nil {
				apiReturn.ErrorDatabase(c, err.Error())
				return
			} else {
				userInfo.ReferralCode = referralCode
				break
			}
		}
	}

	apiReturn.SuccessData(c, systemApiStructs.GetReferralCodeResp{ReferralCode: userInfo.ReferralCode})
}

func (a *UserApi) ResetAll(c *gin.Context) {
	// 1. 物理删除磁盘物理文件 (上传的图标、背景等)
	files := []models.File{}
	if err := global.Db.Find(&files).Error; err == nil {
		for _, v := range files {
			if v.Src != "" {
				_ = os.Remove(v.Src)
			}
		}
	}

	// 2. 依次物理清理所有业务数据表 (双线作战：global.Db + db.DB)
	// 我们遍历两个可能的数据库连接，以防系统处于双库并行状态
	dbs := []*gorm.DB{global.Db}
	if db.DB != nil {
		dbs = append(dbs, db.DB)
	}

	for _, d := range dbs {
		if d == nil {
			continue
		}

		err := d.Transaction(func(tx *gorm.DB) error {
			if err := tx.Unscoped().Where("1 = 1").Delete(&models.WidgetInstance{}).Error; err != nil {
				return err
			}
			if err := tx.Unscoped().Where("1 = 1").Delete(&models.Board{}).Error; err != nil {
				return err
			}
			if err := tx.Unscoped().Where("1 = 1").Delete(&models.ItemIcon{}).Error; err != nil {
				return err
			}
			if err := tx.Unscoped().Where("1 = 1").Delete(&models.ItemIconGroup{}).Error; err != nil {
				return err
			}
			if err := tx.Unscoped().Where("1 = 1").Delete(&models.Integration{}).Error; err != nil {
				return err
			}
			if err := tx.Unscoped().Where("1 = 1").Delete(&models.Notice{}).Error; err != nil {
				return err
			}
			if err := tx.Unscoped().Where("1 = 1").Delete(&models.UserConfig{}).Error; err != nil {
				return err
			}
			if err := tx.Unscoped().Where("1 = 1").Delete(&models.ModuleConfig{}).Error; err != nil {
				return err
			}
			if err := tx.Unscoped().Where("1 = 1").Delete(&models.SystemSetting{}).Error; err != nil {
				return err
			}
			if err := tx.Unscoped().Where("1 = 1").Delete(&models.File{}).Error; err != nil {
				return err
			}
			if err := tx.Unscoped().Where("1 = 1").Delete(&models.Invite{}).Error; err != nil {
				return err
			}
			if err := tx.Unscoped().Where("1 = 1").Delete(&models.User{}).Error; err != nil {
				return err
			}
			return nil
		})
		if err != nil {
			apiReturn.ErrorDatabase(c, err.Error())
			return
		}
	}

	// 3. 强制清空内存中所有已知的缓存池
	if global.UserToken != nil {
		global.UserToken.Flush()
	}
	if global.CUserToken != nil {
		global.CUserToken.Flush()
	}
	if global.SystemSetting != nil && global.SystemSetting.Cache != nil {
		global.SystemSetting.Cache.Flush()
	}
	if global.SystemMonitor != nil {
		global.SystemMonitor.Flush()
	}

	// 4. 重建初始管理员账号 (admin / admin)
	// 在清理完成后立即重新触发初始化
	database.NotFoundAndCreateUser(global.Db)

	apiReturn.Success(c)
}
