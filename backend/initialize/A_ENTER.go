package initialize

import (
	"flag"
	"fmt"
	"matrix-panel/global"
	"matrix-panel/initialize/cUserToken"
	"matrix-panel/initialize/config"
	"matrix-panel/initialize/database"
	"matrix-panel/initialize/lang"
	"matrix-panel/initialize/other"
	"matrix-panel/initialize/redis"
	"matrix-panel/initialize/runlog"
	"matrix-panel/initialize/systemMonitor"
	"matrix-panel/initialize/systemSettingCache"
	"matrix-panel/initialize/userToken"
	"matrix-panel/lib/cmn"
	"matrix-panel/models"
	"matrix-panel/structs"
	"os"
	"time"

	"log"

	"github.com/gin-gonic/gin"
)

var DB_DRIVER = database.SQLITE

// var RUNCODE = "debug"
// var ISDOCER = "" // 是否为docker模式

func InitApp() error {
	Logo()
	gin.SetMode(global.RUNCODE) // GIN 运行模式

	// 日志
	if logger, err := runlog.InitRunlog(global.RUNCODE, "running.log"); err != nil {
		log.Panicln("Log initialization error", err)
		panic(err)
	} else {
		global.Logger = logger
	}

	// 命令行运行
	CommandRun()

	// 配置初始化
	if config, err := config.ConfigInit(); err != nil {
		global.Logger.Errorln("Configuration initialization error", err)
		return err
	} else {
		global.Config = config
	}

	// 多语言初始化
	lang.LangInit("zh-cn") // en-us

	DatabaseConnect()

	// Redis 连接
	{
		// 判断是否有使用redis的驱动，没有将不连接
		cacheDrive := global.Config.GetValueString("base", "cache_drive")
		queueDrive := global.Config.GetValueString("base", "queue_drive")
		if cacheDrive == "redis" || queueDrive == "redis" {
			redisConfig := structs.IniConfigRedis{}
			global.Config.GetSection("redis", &redisConfig)
			rdb, err := redis.InitRedis(redis.Options{
				Addr:     redisConfig.Address,
				Password: redisConfig.Password,
				DB:       redisConfig.Db,
			})

			if err != nil {
				log.Panicln("Redis initialization error", err)
				panic(err)
				// return err
			}
			global.RedisDb = rdb
		}
	}

	// 初始化用户token
	global.UserToken = userToken.InitUserToken()
	global.CUserToken = cUserToken.InitCUserToken()

	// 其他的初始化
	global.VerifyCodeCachePool = other.InitVerifyCodeCachePool()
	global.SystemSetting = systemSettingCache.InItSystemSettingCache()
	global.SystemMonitor = global.NewCache[interface{}](5*time.Hour, -1, "systemMonitorCache")

	// Start background monitoring
	systemMonitor.Start(global.SystemMonitor, 5*time.Second)

	return nil
}

func DatabaseConnect() {
	// 数据库连接 - 开始
	var dbClientInfo database.DbClient
	databaseDrive := global.Config.GetValueStringOrDefault("base", "database_drive")
	if databaseDrive == database.MYSQL {
		dbClientInfo = &database.MySQLConfig{
			Username:    global.Config.GetValueStringOrDefault("mysql", "username"),
			Password:    global.Config.GetValueStringOrDefault("mysql", "password"),
			Host:        global.Config.GetValueStringOrDefault("mysql", "host"),
			Port:        global.Config.GetValueStringOrDefault("mysql", "port"),
			Database:    global.Config.GetValueStringOrDefault("mysql", "db_name"),
			WaitTimeout: global.Config.GetValueInt("mysql", "wait_timeout"),
		}
	} else {
		dbClientInfo = &database.SQLiteConfig{
			Filename: global.Config.GetValueStringOrDefault("sqlite", "file_path"),
		}
	}

	if db, err := database.DbInit(dbClientInfo); err != nil {
		log.Panicln("Database initialization error", err)
		panic(err)
	} else {
		global.Db = db
		models.Db = global.Db
	}

	database.CreateDatabase(databaseDrive, global.Db)

	database.NotFoundAndCreateUser(global.Db)
}

// 命令行运行
func CommandRun() {
	var (
		cfg bool
		pwd bool
	)

	flag.BoolVar(&cfg, "config", false, "Generate configuration file")
	flag.BoolVar(&pwd, "password-reset", false, "Reset the password of the first user")

	flag.Parse()

	if cfg {
		// 生成配置文件
		fmt.Println("Generating configuration file")
		cmn.AssetsTakeFileToPath("conf.example.ini", "conf/conf.example.ini")
		cmn.AssetsTakeFileToPath("conf.example.ini", "conf/conf.ini")
		fmt.Println("The configuration file has been created  conf/conf.ini ", "Please modify according to your own needs")
		// 务必退出
		os.Exit(0)
	} else if pwd {
		// 重置密码

		// 配置初始化
		config, _ := config.ConfigInit()
		global.Config = config

		DatabaseConnect()
		userInfo := models.User{}
		if err := global.Db.Where("role=?", 1).Order("id").First(&userInfo).Error; err != nil {
			fmt.Println("ERROR", err.Error())
			// 务必退出
			os.Exit(0)
		}

		newPassword := "12345678"

		updateInfo := models.User{
			Password: cmn.PasswordEncryption(newPassword),
			Token:    "",
			Status:   1,
		}
		// 重置第一个管理员的密码
		if err := global.Db.Select("Password", "Token", "Status").Where("id=?", userInfo.ID).Updates(&updateInfo).Error; err != nil {
			fmt.Println("ERROR", err.Error())
			// 务必退出
			os.Exit(0)
		}

		fmt.Println("The password has been successfully reset. Here is the account information")
		fmt.Println("Username ", userInfo.Username)
		fmt.Println("Password ", newPassword)
		// 务必退出
		os.Exit(0)
	} else {
		return
	}
	// 务必退出
	os.Exit(0)
}

func Logo() {
	fmt.Println("   __  ___     __       _         ___                __")
	fmt.Println("  /  |/  /__ _/ /______(_)__     / _ \\___ ____  ___ / /")
	fmt.Println(" / /|_/ / _ `/ __/ __/ /\\ \\ /   / ___/ _ `/ _ \\/ -_) / ")
	fmt.Println("/_/  /_/\\_,_/\\__/_/ /_//_\\_\\   /_/   \\_,_/_//_/\\__/_/  ")
	fmt.Println("")

	versionInfo := cmn.GetSysVersionInfo()
	fmt.Println("Version:", versionInfo.Version)
	fmt.Println("Welcome to the matrix-panel.")
	fmt.Println("Project address:", "https://github.com/hslr-s/matrix-panel")

}
