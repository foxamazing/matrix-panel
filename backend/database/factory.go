package database

import (
	"fmt"
	"strings"
)

// NewDatabase 根据配置创建数据库实例
func NewDatabase(config Config) (Database, error) {
	switch strings.ToLower(config.Type) {
	case "sqlite", "sqlite3":
		return NewSQLiteDatabase(config), nil
	case "postgres", "postgresql":
		return NewPostgreSQLDatabase(config), nil
	case "mysql":
		return nil, fmt.Errorf("MySQL support coming soon")
	default:
		return nil, fmt.Errorf("unsupported database type: %s", config.Type)
	}
}

// MustConnect 创建并连接数据库，失败时 panic
func MustConnect(config Config) Database {
	db, err := NewDatabase(config)
	if err != nil {
		panic(fmt.Sprintf("Failed to create database: %v", err))
	}

	if err := db.Connect(); err != nil {
		panic(fmt.Sprintf("Failed to connect to database: %v", err))
	}

	return db
}
