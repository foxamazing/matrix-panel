package db

import (
	"fmt"
	"log"
	"matrix-panel/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB 全局数据库实例
var DB *gorm.DB

// InitDatabase 初始化数据库
func InitDatabase(dbPath string) error {
	var err error

	// 配置GORM
	config := &gorm.Config{
		Logger: logger.Default, // 使用默认logger
	}

	// 连接SQLite数据库
	DB, err = gorm.Open(sqlite.Open(dbPath), config)
	if err != nil {
		return fmt.Errorf("数据库连接失败: %w", err)
	}

	log.Printf("数据库连接成功: %s", dbPath)

	// AutoMigrate - 创建/更新表结构
	err = DB.AutoMigrate(
		&models.Board{},
		&models.WidgetInstance{},
	)
	if err != nil {
		return fmt.Errorf("数据库迁移失败: %w", err)
	}

	log.Println("数据库表迁移完成")

	// 创建默认数据
	if err := createDefaults(); err != nil {
		return fmt.Errorf("创建默认数据失败: %w", err)
	}

	return nil
}

// createDefaults 创建默认数据
func createDefaults() error {
	// 检查是否已有看板
	var count int64
	DB.Model(&models.Board{}).Count(&count)

	if count == 0 {
		// 创建默认看板
		board := models.Board{
			Name:         "Default Dashboard",
			IsPublic:     true,
			CreatorID:    "system",
			LayoutConfig: "{}",
		}

		if err := DB.Create(&board).Error; err != nil {
			return err
		}

		log.Printf("创建默认看板: %s (ID: %s)", board.Name, board.ID)
	}

	return nil
}

// GetDB 获取数据库实例
func GetDB() *gorm.DB {
	return DB
}
