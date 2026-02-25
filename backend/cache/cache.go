package cache

import (
	"context"
	"time"
)

// Cache 缓存接口，抽象不同缓存实现
type Cache interface {
	// Get retrieves a value from cache
	Get(ctx context.Context, key string) (string, error)

	// Set stores a value in cache
	Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error

	// Delete removes a value from cache
	Delete(ctx context.Context, keys ...string) error

	// Exists checks if a key exists
	Exists(ctx context.Context, keys ...string) (int64, error)

	//  Increment increments the integer value of a key
	Incr(ctx context.Context, key string) (int64, error)

	// Expire sets a timeout on key
	Expire(ctx context.Context, key string, expiration time.Duration) error

	// Close closes the cache connection
	Close() error

	// Ping checks if cache is available
	Ping(ctx context.Context) error
}

// Config 缓存配置
type Config struct {
	Enabled  bool
	Type     string // redis, memory
	Address  string
	Password string
	DB       int

	// Connection pool
	PoolSize     int
	MinIdleConns int
}

// DefaultConfig 返回默认配置
func DefaultConfig() Config {
	return Config{
		Enabled:      false,
		Type:         "memory",
		Address:      "localhost:6379",
		PoolSize:     10,
		MinIdleConns: 2,
	}
}
