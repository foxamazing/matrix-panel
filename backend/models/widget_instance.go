package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// WidgetInstance Widget实例模型
type WidgetInstance struct {
	ID             string    `gorm:"type:varchar(36);primaryKey" json:"id"`
	BoardID        string    `gorm:"type:varchar(36);index;not null" json:"boardId"`
	Kind           string    `gorm:"type:varchar(50);index;not null" json:"kind"` // Widget类型
	X              int       `gorm:"not null;default:0" json:"x"`                 // X坐标
	Y              int       `gorm:"not null;default:0" json:"y"`                 // Y坐标
	Width          int       `gorm:"not null;default:2" json:"width"`             // 宽度(格)
	Height         int       `gorm:"not null;default:2" json:"height"`            // 高度(格)
	Options        string    `gorm:"type:text" json:"-"`                          // Widget选项(JSON)
	IntegrationIDs string    `gorm:"type:text" json:"-"`                          // 绑定的集成ID列表(JSON)
	CreatedAt      time.Time `json:"createdAt"`
	UpdatedAt      time.Time `json:"updatedAt"`

	// 关联
	Board Board `gorm:"foreignKey:BoardID;constraint:OnDelete:CASCADE" json:"board,omitempty"`

	// 运行时字段(不存储到数据库)
	OptionsMap        map[string]interface{} `gorm:"-" json:"options,omitempty"`
	IntegrationIDList []string               `gorm:"-" json:"integrationIds,omitempty"`
}

// BeforeCreate GORM钩子 - 创建前生成UUID
func (w *WidgetInstance) BeforeCreate(tx *gorm.DB) error {
	if w.ID == "" {
		w.ID = uuid.New().String()
	}
	return nil
}

// SetOptions 设置Widget选项
func (w *WidgetInstance) SetOptions(options map[string]interface{}) error {
	jsonData, err := json.Marshal(options)
	if err != nil {
		return err
	}
	w.Options = string(jsonData)
	w.OptionsMap = options
	return nil
}

// GetOptions 获取Widget选项
func (w *WidgetInstance) GetOptions() (map[string]interface{}, error) {
	if w.OptionsMap != nil {
		return w.OptionsMap, nil
	}

	if w.Options == "" {
		return make(map[string]interface{}), nil
	}

	var options map[string]interface{}
	if err := json.Unmarshal([]byte(w.Options), &options); err != nil {
		return nil, err
	}
	w.OptionsMap = options
	return options, nil
}

// SetIntegrationIDs 设置集成ID列表
func (w *WidgetInstance) SetIntegrationIDs(ids []string) error {
	jsonData, err := json.Marshal(ids)
	if err != nil {
		return err
	}
	w.IntegrationIDs = string(jsonData)
	w.IntegrationIDList = ids
	return nil
}

// GetIntegrationIDs 获取集成ID列表
func (w *WidgetInstance) GetIntegrationIDs() ([]string, error) {
	if w.IntegrationIDList != nil {
		return w.IntegrationIDList, nil
	}

	if w.IntegrationIDs == "" {
		return []string{}, nil
	}

	var ids []string
	if err := json.Unmarshal([]byte(w.IntegrationIDs), &ids); err != nil {
		return nil, err
	}
	w.IntegrationIDList = ids
	return ids, nil
}

// TableName 指定表名
func (WidgetInstance) TableName() string {
	return "widget_instances"
}
