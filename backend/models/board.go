package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Board 看板模型
type Board struct {
	ID           string    `gorm:"type:varchar(36);primaryKey" json:"id"`
	Name         string    `gorm:"type:varchar(100);not null" json:"name"`
	IsPublic     bool      `gorm:"default:false" json:"isPublic"`
	CreatorID    string    `gorm:"type:varchar(36);index" json:"creatorId"`
	LayoutConfig string    `gorm:"type:text" json:"layoutConfig"` // JSON配置
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`

	// 关联
	Creator         User             `gorm:"foreignKey:CreatorID" json:"creator,omitempty"`
	WidgetInstances []WidgetInstance `gorm:"foreignKey:BoardID;constraint:OnDelete:CASCADE" json:"widgets,omitempty"`
}

// BeforeCreate GORM钩子 - 创建前生成UUID
func (b *Board) BeforeCreate(tx *gorm.DB) error {
	if b.ID == "" {
		b.ID = uuid.New().String()
	}
	return nil
}

// TableName 指定表名
func (Board) TableName() string {
	return "boards"
}
