package sabnzbd

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// SABnzbdIntegration SABnzbd下载客户端集成
type SABnzbdIntegration struct {
	*integration.BaseIntegration
}

// New 创建SABnzbd集成实例
func New(id, name, url string, secrets map[string]string) *SABnzbdIntegration {
	return &SABnzbdIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "sabnzbd", url, secrets),
	}
}

// TestConnection 测试SABnzbd连接
func (s *SABnzbdIntegration) TestConnection(ctx context.Context) error {
	apiKey := s.GetSecret("apiKey")
	if apiKey == "" {
		return fmt.Errorf("API密钥未配置")
	}

	url := s.BuildURL("/api")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return err
	}

	q := req.URL.Query()
	q.Add("mode", "version")
	q.Add("apikey", apiKey)
	q.Add("output", "json")
	req.URL.RawQuery = q.Encode()

	resp, err := s.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("连接失败: HTTP %d", resp.StatusCode)
	}

	return nil
}

// GetQueue 获取下载队列
func (s *SABnzbdIntegration) GetQueue(ctx context.Context) (*QueueInfo, error) {
	apiKey := s.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	url := s.BuildURL("/api")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	q := req.URL.Query()
	q.Add("mode", "queue")
	q.Add("apikey", apiKey)
	q.Add("output", "json")
	req.URL.RawQuery = q.Encode()

	resp, err := s.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取队列失败: HTTP %d", resp.StatusCode)
	}

	var response struct {
		Queue SABQueue `json:"queue"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, err
	}

	queue := &QueueInfo{
		Speed:     response.Queue.Speed,
		SizeLeft:  response.Queue.MBLeft,
		TotalSize: response.Queue.MB,
		TimeLeft:  response.Queue.TimeLeft,
		Status:    response.Queue.Status,
		JobCount:  len(response.Queue.Slots),
	}

	for _, slot := range response.Queue.Slots {
		queue.Jobs = append(queue.Jobs, QueueJob{
			Name:     slot.Filename,
			Size:     slot.MB,
			SizeLeft: slot.MBLeft,
			Progress: slot.Percentage,
			Status:   slot.Status,
		})
	}

	return queue, nil
}
