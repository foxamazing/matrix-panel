package database

import (
	"context"
	"fmt"
	"time"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// SQLiteDatabase SQLite 数据库实现
type SQLiteDatabase struct {
	db     *gorm.DB
	config Config
}

// NewSQLiteDatabase 创建 SQLite 数据库实例
func NewSQLiteDatabase(config Config) *SQLiteDatabase {
	return &SQLiteDatabase{
		config: config,
	}
}

// Connect 连接数据库
func (s *SQLiteDatabase) Connect() error {
	db, err := gorm.Open(sqlite.Open(s.config.Database), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to SQLite: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get sql.DB: %w", err)
	}

	// Configure connection pool
	sqlDB.SetMaxOpenConns(s.config.MaxOpenConns)
	sqlDB.SetMaxIdleConns(s.config.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(s.config.ConnMaxLifetime)
	sqlDB.SetConnMaxIdleTime(s.config.ConnMaxIdleTime)

	s.db = db
	return nil
}

// Close 关闭数据库连接
func (s *SQLiteDatabase) Close() error {
	if s.db == nil {
		return nil
	}
	sqlDB, err := s.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// Ping 检查数据库连接
func (s *SQLiteDatabase) Ping(ctx context.Context) error {
	if s.db == nil {
		return fmt.Errorf("database not connected")
	}
	sqlDB, err := s.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.PingContext(ctx)
}

// DB 返回 GORM 实例
func (s *SQLiteDatabase) DB() *gorm.DB {
	return s.db
}

// AutoMigrate 自动迁移数据库结构
func (s *SQLiteDatabase) AutoMigrate(models ...interface{}) error {
	return s.db.AutoMigrate(models...)
}

// Transaction 执行事务
func (s *SQLiteDatabase) Transaction(fn func(*gorm.DB) error) error {
	return s.db.Transaction(fn)
}

// IsHealthy 检查数据库健康状态
func (s *SQLiteDatabase) IsHealthy() bool {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	return s.Ping(ctx) == nil
}

// Stats 返回数据库统计信息
func (s *SQLiteDatabase) Stats() DatabaseStats {
	if s.db == nil {
		return DatabaseStats{}
	}

	sqlDB, err := s.db.DB()
	if err != nil {
		return DatabaseStats{}
	}

	stats := sqlDB.Stats()
	return DatabaseStats{
		OpenConnections:   stats.OpenConnections,
		InUse:             stats.InUse,
		Idle:              stats.Idle,
		WaitCount:         stats.WaitCount,
		WaitDuration:      stats.WaitDuration,
		MaxIdleClosed:     stats.MaxIdleClosed,
		MaxLifetimeClosed: stats.MaxLifetimeClosed,
	}
}
