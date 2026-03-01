package models

import (
	"encoding/json"
	"matrix-panel/lib/crypto"
)

// Integration 集成配置模型
type Integration struct {
	BaseModel
	Name    string `json:"name" gorm:"type:varchar(100);not null;comment:集成名称"`
	Kind    string `json:"kind" gorm:"type:varchar(50);not null;index;comment:集成类型"`
	URL     string `json:"url" gorm:"type:varchar(255);comment:连接地址"`
	Icon    string `json:"icon" gorm:"type:varchar(255);comment:图标"`
	Secrets string `json:"-" gorm:"type:text;comment:加密的敏感配置JSON"`
	Enable  bool   `json:"enable" gorm:"default:true;comment:是否启用"`

	// 非数据库字段,用于JSON交互
	SecretMap map[string]string `json:"secrets,omitempty" gorm:"-"`
}

// BeforeSave 保存前加密并序列化SecretMap
func (i *Integration) BeforeSave() error {
	if i.SecretMap != nil {
		// 序列化为JSON
		bytes, err := json.Marshal(i.SecretMap)
		if err != nil {
			return err
		}

		// 加密
		encrypted, err := crypto.EncryptSecret(string(bytes))
		if err != nil {
			return err
		}

		i.Secrets = encrypted
	}
	return nil
}

// AfterFind 查询后解密并反序列化为SecretMap
func (i *Integration) AfterFind() error {
	if i.Secrets != "" {
		// 解密
		decrypted, err := crypto.DecryptSecret(i.Secrets)
		if err != nil {
			return err
		}

		// 反序列化JSON
		return json.Unmarshal([]byte(decrypted), &i.SecretMap)
	}
	return nil
}
