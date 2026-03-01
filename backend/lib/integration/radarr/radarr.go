package radarr

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
	"time"
)

// RadarrIntegration Radarr电影管理集成
type RadarrIntegration struct {
	*integration.BaseIntegration
}

// New 创建Radarr集成实例
func New(id, name, url string, secrets map[string]string) *RadarrIntegration {
	return &RadarrIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindRadarr), url, secrets),
	}
}

// TestConnection 测试Radarr连接
func (r *RadarrIntegration) TestConnection(ctx context.Context) error {
	apiKey := r.GetSecret("apiKey")
	if apiKey == "" {
		return fmt.Errorf("API密钥未配置")
	}

	url := r.BuildURL("/api/v3/system/status")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("X-Api-Key", apiKey)
	resp, err := r.Client.Do(req)
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
func (r *RadarrIntegration) GetCalendar(ctx context.Context, start, end time.Time, includeUnmonitored bool) ([]CalendarEvent, error) {
	apiKey := r.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	url := r.BuildURL("/api/v3/calendar")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	q := req.URL.Query()
	q.Add("start", start.Format(time.RFC3339))
	q.Add("end", end.Format(time.RFC3339))
	q.Add("unmonitored", fmt.Sprintf("%t", includeUnmonitored))
	req.URL.RawQuery = q.Encode()

	req.Header.Set("X-Api-Key", apiKey)
	resp, err := r.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取日历失败: HTTP %d", resp.StatusCode)
	}

	var radarrEvents []RadarrCalendarEvent
	if err := json.NewDecoder(resp.Body).Decode(&radarrEvents); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	result := make([]CalendarEvent, 0, len(radarrEvents))
	for _, event := range radarrEvents {
		posterURL := ""
		for _, img := range event.Images {
			if img.CoverType == "poster" {
				posterURL = img.RemoteURL
				break
			}
		}

		calEvent := CalendarEvent{
			Title:       event.Title,
			ReleaseDate: event.InCinemas,
			ImageURL:    posterURL,
			Year:        event.Year,
			TitleSlug:   event.TitleSlug,
			IMDbID:      event.IMDbID,
			TMDbID:      event.TMDbID,
		}
		result = append(result, calEvent)
	}

	return result, nil
}

// GetMovies 获取所有电影
func (r *RadarrIntegration) GetMovies(ctx context.Context) ([]Movie, error) {
	apiKey := r.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	url := r.BuildURL("/api/v3/movie")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-Api-Key", apiKey)
	resp, err := r.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取电影列表失败: HTTP %d", resp.StatusCode)
	}

	var radarrMovies []RadarrMovie
	if err := json.NewDecoder(resp.Body).Decode(&radarrMovies); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	result := make([]Movie, 0, len(radarrMovies))
	for _, m := range radarrMovies {
		posterURL := ""
		for _, img := range m.Images {
			if img.CoverType == "poster" {
				posterURL = img.RemoteURL
				break
			}
		}

		movie := Movie{
			ID:        m.ID,
			Title:     m.Title,
			TitleSlug: m.TitleSlug,
			Status:    m.Status,
			Overview:  m.Overview,
			Year:      m.Year,
			PosterURL: posterURL,
			IMDbID:    m.IMDbID,
			TMDbID:    m.TMDbID,
			Rating:    m.Ratings.Value,
			Monitored: m.Monitored,
		}
		result = append(result, movie)
	}

	return result, nil
}

// GetQueue 获取下载队列
func (r *RadarrIntegration) GetQueue(ctx context.Context) ([]QueueItem, error) {
	apiKey := r.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	url := r.BuildURL("/api/v3/queue")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-Api-Key", apiKey)
	resp, err := r.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取队列失败: HTTP %d", resp.StatusCode)
	}

	var queueResponse struct {
		Records []RadarrQueueItem `json:"records"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&queueResponse); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	result := make([]QueueItem, 0, len(queueResponse.Records))
	for _, item := range queueResponse.Records {
		queueItem := QueueItem{
			ID:       item.ID,
			Title:    item.Movie.Title,
			Quality:  item.Quality.Quality.Name,
			Size:     item.Size,
			SizeLeft: item.Sizeleft,
			Status:   item.Status,
		}
		result = append(result, queueItem)
	}

	return result, nil
}
