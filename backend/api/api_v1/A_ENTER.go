package api_v1

import (
	"matrix-panel/api/api_v1/openness"
	"matrix-panel/api/api_v1/panel"
	"matrix-panel/api/api_v1/system"
)

type ApiGroup struct {
	ApiSystem system.ApiSystem // 系统功能api
	ApiOpen   openness.ApiOpenness
	ApiPanel  panel.ApiPanel
}

var ApiGroupApp = new(ApiGroup)
