package cache

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// RedisCache Redis 缓存实现
type RedisCache struct {
	client *redis.Client
	config Config
}

// NewRedisCache 创建 Redis 缓存实例
func NewRedisCache(config Config) *RedisCache {
	client := redis.NewClient(&redis.Options{
		Addr:         config.Address,
		Password:     config.Password,
		DB:           config.DB,
		PoolSize:     config.PoolSize,
		MinIdleConns: config.MinIdleConns,
	})

	return &RedisCache{
		client: client,
		config: config,
	}
}

// Get retrieves a value from cache
func (r *RedisCache) Get(ctx context.Context, key string) (string, error) {
	val, err := r.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return "", ErrCacheMiss
	}
	return val, err
}

// Set stores a value in cache
func (r *RedisCache) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	return r.client.Set(ctx, key, value, expiration).Err()
}

// Delete removes values from cache
func (r *RedisCache) Delete(ctx context.Context, keys ...string) error {
	return r.client.Del(ctx, keys...).Err()
}

// Exists checks if keys exist
func (r *RedisCache) Exists(ctx context.Context, keys ...string) (int64, error) {
	return r.client.Exists(ctx, keys...).Result()
}

// Incr increments the integer value of a key
func (r *RedisCache) Incr(ctx context.Context, key string) (int64, error) {
	return r.client.Incr(ctx, key).Result()
}

// Expire sets a timeout on key
func (r *RedisCache) Expire(ctx context.Context, key string, expiration time.Duration) error {
	return r.client.Expire(ctx, key, expiration).Err()
}

// Close closes the Redis connection
func (r *RedisCache) Close() error {
	return r.client.Close()
}

// Ping checks if Redis is available
func (r *RedisCache) Ping(ctx context.Context) error {
	return r.client.Ping(ctx).Err()
}

// ErrCacheMiss 缓存未命中错误
var ErrCacheMiss = fmt.Errorf("cache: key not found")
