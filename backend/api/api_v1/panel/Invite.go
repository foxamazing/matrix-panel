package panel

import (
	"crypto/rand"
	"encoding/hex"
	"time"

	"matrix-panel/api/api_v1/common/apiReturn"
	"matrix-panel/api/api_v1/common/base"
	"matrix-panel/models"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type InviteApi struct{}

// GetList returns all invites.
func (a InviteApi) GetList(c *gin.Context) {
	mInvite := models.Invite{}
	list, err := mInvite.GetInvites()
	if err != nil {
		apiReturn.ErrorDatabase(c, err.Error())
		return
	}
	apiReturn.SuccessData(c, list)
}

// Create creates an invite token.
func (a InviteApi) Create(c *gin.Context) {
	var req struct {
		ExpirationDate time.Time `json:"expirationDate" binding:"required"`
	}
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		apiReturn.ErrorParamFomat(c, err.Error())
		return
	}

	currentUser, _ := base.GetCurrentUserInfo(c)
	tokenBytes := make([]byte, 20)
	if _, err := rand.Read(tokenBytes); err != nil {
		apiReturn.Error(c, "failed to generate token")
		return
	}
	token := hex.EncodeToString(tokenBytes)

	mInvite := models.Invite{
		Token:          token,
		ExpirationDate: req.ExpirationDate,
		CreatorID:      currentUser.ID,
	}
	if err := mInvite.CreateOne(); err != nil {
		apiReturn.ErrorDatabase(c, err.Error())
		return
	}
	apiReturn.SuccessData(c, mInvite)
}

// Delete deletes an invite by id.
func (a InviteApi) Delete(c *gin.Context) {
	var req struct {
		ID uint `json:"id" binding:"required"`
	}
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		apiReturn.ErrorParamFomat(c, err.Error())
		return
	}

	mInvite := models.Invite{}
	if err := mInvite.DeleteById(req.ID); err != nil {
		apiReturn.ErrorDatabase(c, err.Error())
		return
	}

	apiReturn.Success(c)
}

// Validate validates invite token in public mode.
func (a InviteApi) Validate(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		apiReturn.ErrorParamFomat(c, "token is required")
		return
	}

	mInvite := models.Invite{}
	invite, err := mInvite.GetByToken(token)
	if err != nil {
		apiReturn.Error(c, err.Error())
		return
	}

	apiReturn.SuccessData(c, gin.H{
		"valid":          true,
		"expirationDate": invite.ExpirationDate,
	})
}
