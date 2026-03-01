package system

import (
	"errors"
	"matrix-panel/global"
	"matrix-panel/lib/cmn"
	"matrix-panel/models"
	"strconv"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthService struct{}

// Login 处理登录逻辑
func (s *AuthService) Login(username, password string) (*models.User, string, error) {
	mUser := models.User{}
	var (
		err  error
		info models.User
	)

	// 1. 查询用户
	// param.Username = strings.TrimSpace(param.Username) // Controller层处理
	if info, err = mUser.GetUserInfoByUsername(username); err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, "", errors.New("用户不存在或密码错误") // 统一错误信息，防止枚举
		}
		return nil, "", err
	}

	// 2. 验证密码
	if !cmn.VerifyPassword(info.Password, password) {
		return nil, "", errors.New("用户不存在或密码错误")
	}

	// 3. 升级哈希 (如果需要)
	if !cmn.IsBcryptHash(info.Password) {
		mUser.UpdateUserInfoByUserId(info.ID, map[string]interface{}{
			"password": cmn.PasswordEncryption(password),
		})
	}

	// 4. 检查状态
	if info.Status != 1 {
		return nil, "", errors.New("账号已停用或未激活")
	}

	// 5. 自动提升为管理员 (如果是第一个用户)
	{
		var adminCount int64
		if err := global.Db.Model(&models.User{}).Where("role=?", 1).Count(&adminCount).Error; err == nil && adminCount == 0 {
			if err := global.Db.Model(&models.User{}).Where("id=?", info.ID).Update("role", 1).Error; err == nil {
				info.Role = 1
			}
		}
	}

	// 6. Token 管理 (Base Token)
	bToken := info.Token
	if info.Token == "" {
		buildTokenOver := false
		for !buildTokenOver {
			bToken = cmn.BuildRandCode(32, cmn.RAND_CODE_MODE2)
			if _, err := mUser.GetUserInfoByToken(bToken); err != nil {
				mUser.UpdateUserInfoByUserId(info.ID, map[string]interface{}{
					"token": bToken,
				})
				buildTokenOver = true
			}
		}
		info.Token = bToken
	}

	// 7. 生成 Client Token (Session Token)
	cToken := uuid.NewString() + "-" + cmn.Md5(cmn.Md5("userId"+strconv.Itoa(int(info.ID))))
	global.CUserToken.SetDefault(cToken, bToken)

	// 清除敏感信息
	info.Password = ""
	info.ReferralCode = ""

	return &info, cToken, nil
}

// Logout 处理登出逻辑
func (s *AuthService) Logout(cToken string) {
	global.CUserToken.Delete(cToken)
}
