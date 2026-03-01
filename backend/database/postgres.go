package database

import (
	"context"
	"fmt"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// PostgreSQLDatabase PostgreSQL 数据库实现
type PostgreSQLDatabase struct {
	db     *gorm.DB
	config Config
}

// NewPostgreSQLDatabase 创建 PostgreSQL 数据库实例
func NewPostgreSQLDatabase(config Config) *PostgreSQLDatabase {
	return &PostgreSQLDatabase{
		config: config,
	}
}

// Connect 连接数据库
func (p *PostgreSQLDatabase) Connect() error {
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		p.config.Host,
		p.config.Port,
		p.config.Username,
		p.config.Password,
		p.config.Database,
		p.config.SSLMode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to PostgreSQL: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return fmt.Errorf("failed to get sql.DB: %w", err)
	}

	// Configure connection pool
	sqlDB.SetMaxOpenConns(p.config.MaxOpenConns)
	sqlDB.SetMaxIdleConns(p.config.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(p.config.ConnMaxLifetime)
	sqlDB.SetConnMaxIdleTime(p.config.ConnMaxIdleTime)

	p.db = db
	return nil
}

// Close 关闭数据库连接
func (p *PostgreSQLDatabase) Close() error {
	if p.db == nil {
		return nil
	}
	sqlDB, err := p.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// Ping 检查数据库连接
func (p *PostgreSQLDatabase) Ping(ctx context.Context) error {
	if p.db == nil {
		return fmt.Errorf("database not connected")
	}
	sqlDB, err := p.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.PingContext(ctx)
}

// DB 返回 GORM 实例
func (p *PostgreSQLDatabase) DB() *gorm.DB {
	return p.db
}

// AutoMigrate 自动迁移数据库结构
func (p *PostgreSQLDatabase) AutoMigrate(models ...interface{}) error {
	return p.db.AutoMigrate(models...)
}

// Transaction 执行事务
func (p *PostgreSQLDatabase) Transaction(fn func(*gorm.DB) error) error {
	return p.db.Transaction(fn)
}

// IsHealthy 检查数据库健康状态
func (p *PostgreSQLDatabase) IsHealthy() bool {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	return p.Ping(ctx) == nil
}

// Stats 返回数据库统计信息
func (p *PostgreSQLDatabase) Stats() DatabaseStats {
	if p.db == nil {
		return DatabaseStats{}
	}

	sqlDB, err := p.db.DB()
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
