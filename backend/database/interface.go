package database

import (
	"context"
	"time"

	"gorm.io/gorm"
)

// Database 数据库接口，抽象不同数据库实现
type Database interface {
	// Connection
	Connect() error
	Close() error
	Ping(ctx context.Context) error

	// GORM access
	DB() *gorm.DB

	// Migration
	AutoMigrate(models ...interface{}) error

	// Transaction
	Transaction(fn func(*gorm.DB) error) error

	// Health
	IsHealthy() bool
	Stats() DatabaseStats
}

// DatabaseStats 数据库统计信息
type DatabaseStats struct {
	OpenConnections   int
	InUse             int
	Idle              int
	WaitCount         int64
	WaitDuration      time.Duration
	MaxIdleClosed     int64
	MaxLifetimeClosed int64
}

// Config 数据库配置
type Config struct {
	Type     string // sqlite, postgres, mysql
	Host     string
	Port     int
	Database string
	Username string
	Password string
	SSLMode  string

	// Connection pool
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
	ConnMaxIdleTime time.Duration
}

// DefaultConfig 返回默认配置
func DefaultConfig() Config {
	return Config{
		Type:            "sqlite",
		Database:        "data.db",
		MaxOpenConns:    25,
		MaxIdleConns:    5,
		ConnMaxLifetime: time.Hour,
		ConnMaxIdleTime: 10 * time.Minute,
	}
}
