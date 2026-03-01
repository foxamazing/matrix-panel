package lidarr

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
	"time"
)

// LidarrIntegration Lidarr音乐管理集成
type LidarrIntegration struct {
	*integration.BaseIntegration
}

// New 创建Lidarr集成实例
func New(id, name, url string, secrets map[string]string) *LidarrIntegration {
	return &LidarrIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindLidarr), url, secrets),
	}
}

// TestConnection 测试Lidarr连接
func (l *LidarrIntegration) TestConnection(ctx context.Context) error {
	apiKey := l.GetSecret("apiKey")
	if apiKey == "" {
		return fmt.Errorf("API密钥未配置")
	}

	url := l.BuildURL("/api/v1/system/status")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("X-Api-Key", apiKey)
	resp, err := l.Client.Do(req)
	if err != nil {
		return fmt.Errorf("连接失败: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("服务器返回错误状态: %d", resp.StatusCode)
	}

	return nil
}

// GetCalendar 获取日历事件
func (l *LidarrIntegration) GetCalendar(ctx context.Context, start, end time.Time) ([]CalendarEvent, error) {
	apiKey := l.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	url := l.BuildURL("/api/v1/calendar")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	q := req.URL.Query()
	q.Add("start", start.Format(time.RFC3339))
	q.Add("end", end.Format(time.RFC3339))
	req.URL.RawQuery = q.Encode()

	req.Header.Set("X-Api-Key", apiKey)
	resp, err := l.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取日历失败: HTTP %d", resp.StatusCode)
	}

	var lidarrEvents []LidarrCalendarEvent
	if err := json.NewDecoder(resp.Body).Decode(&lidarrEvents); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	result := make([]CalendarEvent, 0, len(lidarrEvents))
	for _, event := range lidarrEvents {
		calEvent := CalendarEvent{
			Title:       event.Title,
			Artist:      event.Artist.ArtistName,
			ReleaseDate: event.ReleaseDate,
		}
		result = append(result, calEvent)
	}

	return result, nil
}

// GetArtists 获取所有艺术家
func (l *LidarrIntegration) GetArtists(ctx context.Context) ([]Artist, error) {
	apiKey := l.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	url := l.BuildURL("/api/v1/artist")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-Api-Key", apiKey)
	resp, err := l.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取艺术家列表失败: HTTP %d", resp.StatusCode)
	}

	var lidarrArtists []LidarrArtist
	if err := json.NewDecoder(resp.Body).Decode(&lidarrArtists); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	result := make([]Artist, 0, len(lidarrArtists))
	for _, a := range lidarrArtists {
		artist := Artist{
			ID:        a.ID,
			Name:      a.ArtistName,
			Overview:  a.Overview,
			Monitored: a.Monitored,
		}
		result = append(result, artist)
	}

	return result, nil
}
