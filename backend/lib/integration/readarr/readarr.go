package readarr

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// ReadarrIntegration Readarr电子书管理集成
type ReadarrIntegration struct {
	*integration.BaseIntegration
}

// New 创建Readarr集成实例
func New(id, name, url string, secrets map[string]string) *ReadarrIntegration {
	return &ReadarrIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "readarr", url, secrets),
	}
}

// TestConnection 测试Readarr连接
func (r *ReadarrIntegration) TestConnection(ctx context.Context) error {
	apiKey := r.GetSecret("apiKey")
	if apiKey == "" {
		return fmt.Errorf("API密钥未配置")
	}

	url := r.BuildURL("/api/v1/system/status")
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("X-Api-Key", apiKey)

	resp, err := r.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("连接失败: HTTP %d", resp.StatusCode)
	}
	return nil
}

// GetBooks 获取图书列表
func (r *ReadarrIntegration) GetBooks(ctx context.Context) ([]Book, error) {
	apiKey := r.GetSecret("apiKey")
	url := r.BuildURL("/api/v1/book")
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("X-Api-Key", apiKey)

	resp, err := r.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var books []Book
	json.NewDecoder(resp.Body).Decode(&books)
	return books, nil
}

type Book struct {
	ID     int    `json:"id"`
	Title  string `json:"title"`
	Author string `json:"author"`
}
