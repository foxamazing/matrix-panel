package models

import (
	"errors"
	"time"
)

// Invite 邀请码模型
type Invite struct {
	BaseModel
	Token          string    `gorm:"type:varchar(64);uniqueIndex" json:"token"` // 邀请码 Token
	ExpirationDate time.Time `json:"expirationDate"`                            // 过期时间
	CreatorID      uint      `json:"creatorId"`                                 // 创建者 ID
	Creator        User      `gorm:"foreignKey:CreatorID" json:"creator"`       // 关联创建者
}

// GetInvites 获取所有邀请码
func (m *Invite) GetInvites() ([]Invite, error) {
	var invites []Invite
	err := Db.Preload("Creator").Order("expiration_date asc").Find(&invites).Error
	return invites, err
}

// CreateOne 创建邀请码
func (m *Invite) CreateOne() error {
	return Db.Create(m).Error
}

// DeleteById 删除邀请码
func (m *Invite) DeleteById(id uint) error {
	return Db.Delete(&Invite{}, id).Error
}

// CheckToken 验证 Token 是否有效
func (m *Invite) GetByToken(token string) (Invite, error) {
	var invite Invite
	err := Db.Where("token = ? AND expiration_date > ?", token, time.Now()).First(&invite).Error
	if err != nil {
		return invite, errors.New("邀请码无效或已过期")
	}
	return invite, nil
}
