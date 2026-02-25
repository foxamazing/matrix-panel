package integration

import (
	"context"
	"net/http"
	"strings"
	"time"
)

// Integration 集成接口 - 所有集成必须实现
type Integration interface {
	// 获取集成ID
	GetID() string
	// 获取集成名称
	GetName() string
	// 获取集成类型（kind）
	GetKind() string
	// 测试连接
	TestConnection(ctx context.Context) error
	// 获取配置的URL
	GetURL() string
}

// BaseIntegration 基础集成实现 - 提供通用功能
type BaseIntegration struct {
	ID      string
	Name    string
	Kind    string
	URL     string
	Secrets map[string]string
	Client  *http.Client
}

// NewBaseIntegration 创建基础集成实例
func NewBaseIntegration(id, name, kind, url string, secrets map[string]string) *BaseIntegration {
	return &BaseIntegration{
		ID:      id,
		Name:    name,
		Kind:    kind,
		URL:     url,
		Secrets: secrets,
		Client: &http.Client{
			Timeout: 30 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:        10,
				IdleConnTimeout:     30 * time.Second,
				TLSHandshakeTimeout: 10 * time.Second,
			},
		},
	}
}

// GetID 获取集成ID
func (b *BaseIntegration) GetID() string {
	return b.ID
}

// GetName 获取集成名称
func (b *BaseIntegration) GetName() string {
	return b.Name
}

// GetKind 获取集成类型
func (b *BaseIntegration) GetKind() string {
	return b.Kind
}

// GetURL 获取配置的URL
func (b *BaseIntegration) GetURL() string {
	return b.URL
}

// GetSecret 获取密钥值
func (b *BaseIntegration) GetSecret(key string) string {
	if b.Secrets == nil {
		return ""
	}
	return b.Secrets[key]
}

// BuildURL 构建完整URL路径
func (b *BaseIntegration) BuildURL(path string) string {
	baseURL := strings.TrimRight(b.URL, "/")
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	return baseURL + path
}

// DoRequest 执行HTTP请求的辅助方法
func (b *BaseIntegration) DoRequest(ctx context.Context, method, url string, headers map[string]string) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, method, url, nil)
	if err != nil {
		return nil, err
	}

	// 设置请求头
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	return b.Client.Do(req)
}
