package systemSettingCache

import (
	"matrix-panel/global"
	"matrix-panel/lib/cmn/systemSetting"
	"time"
)

func InItSystemSettingCache() *systemSetting.SystemSettingCache {
	return &systemSetting.SystemSettingCache{
		Cache: global.NewCache[interface{}](5*time.Hour, -1, "systemSettingCache"),
	}
}
