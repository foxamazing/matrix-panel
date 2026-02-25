package cache

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// MemoryCache 内存缓存实现（fallback）
type MemoryCache struct {
	data   map[string]cacheItem
	mu     sync.RWMutex
	config Config
}

type cacheItem struct {
	value      string
	expiration time.Time
}

// NewMemoryCache 创建内存缓存实例
func NewMemoryCache(config Config) *MemoryCache {
	cache := &MemoryCache{
		data:   make(map[string]cacheItem),
		config: config,
	}

	// Start cleanup goroutine
	go cache.cleanup()

	return cache
}

// Get retrieves a value from cache
func (m *MemoryCache) Get(ctx context.Context, key string) (string, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	item, exists := m.data[key]
	if !exists {
		return "", ErrCacheMiss
	}

	if !item.expiration.IsZero() && time.Now().After(item.expiration) {
		return "", ErrCacheMiss
	}

	return item.value, nil
}

// Set stores a value in cache
func (m *MemoryCache) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	var exp time.Time
	if expiration > 0 {
		exp = time.Now().Add(expiration)
	}

	m.data[key] = cacheItem{
		value:      fmt.Sprintf("%v", value),
		expiration: exp,
	}

	return nil
}

// Delete removes values from cache
func (m *MemoryCache) Delete(ctx context.Context, keys ...string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	for _, key := range keys {
		delete(m.data, key)
	}

	return nil
}

// Exists checks if keys exist
func (m *MemoryCache) Exists(ctx context.Context, keys ...string) (int64, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	var count int64
	for _, key := range keys {
		if item, exists := m.data[key]; exists {
			if item.expiration.IsZero() || time.Now().Before(item.expiration) {
				count++
			}
		}
	}

	return count, nil
}

// Incr increments the integer value of a key
func (m *MemoryCache) Incr(ctx context.Context, key string) (int64, error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	item, exists := m.data[key]
	if !exists {
		m.data[key] = cacheItem{value: "1", expiration: time.Time{}}
		return 1, nil
	}

	var val int64
	_, err := fmt.Sscanf(item.value, "%d", &val)
	if err != nil {
		return 0, fmt.Errorf("value is not an integer")
	}

	val++
	item.value = fmt.Sprintf("%d", val)
	m.data[key] = item

	return val, nil
}

// Expire sets a timeout on key
func (m *MemoryCache) Expire(ctx context.Context, key string, expiration time.Duration) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	item, exists := m.data[key]
	if !exists {
		return ErrCacheMiss
	}

	item.expiration = time.Now().Add(expiration)
	m.data[key] = item

	return nil
}

// Close closes the cache (no-op for memory cache)
func (m *MemoryCache) Close() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	m.data = make(map[string]cacheItem)
	return nil
}

// Ping checks if cache is available (always true for memory)
func (m *MemoryCache) Ping(ctx context.Context) error {
	return nil
}

// cleanup removes expired items periodically
func (m *MemoryCache) cleanup() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		m.mu.Lock()
		now := time.Now()
		for key, item := range m.data {
			if !item.expiration.IsZero() && now.After(item.expiration) {
				delete(m.data, key)
			}
		}
		m.mu.Unlock()
	}
}
