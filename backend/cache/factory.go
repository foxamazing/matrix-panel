package cache

import (
	"context"
	"fmt"
	"strings"
	"time"
)

// NewCache 根据配置创建缓存实例
func NewCache(config Config) (Cache, error) {
	if !config.Enabled {
		return NewMemoryCache(config), nil
	}

	switch strings.ToLower(config.Type) {
	case "redis":
		cache := NewRedisCache(config)
		// Test connection
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := cache.Ping(ctx); err != nil {
			// Fall back to memory cache if Redis is unavailable
			fmt.Printf("Warning: Redis unavailable, falling back to memory cache: %v\n", err)
			return NewMemoryCache(config), nil
		}
		return cache, nil
	case "memory", "":
		return NewMemoryCache(config), nil
	default:
		return nil, fmt.Errorf("unsupported cache type: %s", config.Type)
	}
}

// MustNewCache 创建缓存实例，失败时 panic
func MustNewCache(config Config) Cache {
	cache, err := NewCache(config)
	if err != nil {
		panic(fmt.Sprintf("Failed to create cache: %v", err))
	}
	return cache
}
