package global

import (
	"matrix-panel/initialize/database"
	"matrix-panel/lib/cache"
	"matrix-panel/lib/cmn/systemSetting"
	"matrix-panel/lib/iniConfig"
	"matrix-panel/lib/language"
	"matrix-panel/models"

	redis "github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

var (
	ISDOCKER = ""      // 是否为docker模式运行
	RUNCODE  = "debug" // 运行模式：debug | release
	// DB_MYSQL  = "mysql"
	// DB_SQLITE = "sqlite"
	DB_DRIVER = database.SQLITE
)

// var Log *cmn.LogStruct

var (
	Lang *language.LangStructObj

	UserToken  cache.Cacher[models.User]
	CUserToken cache.Cacher[string] // 用户token
	Logger     *zap.SugaredLogger
	// 支持通过http以及配置文件动态修改日志级别
	LoggerLevel         = zap.NewAtomicLevel()
	VerifyCodeCachePool cache.Cacher[string]
	Config              *iniConfig.IniConfig
	Db                  *gorm.DB
	RedisDb             *redis.Client
	SystemSetting       *systemSetting.SystemSettingCache
	SystemMonitor       cache.Cacher[interface{}]
	RateLimit           *RateLimiter
	WSHub               interface{} // 存储 *websocket.Hub，避免循环引用
)
