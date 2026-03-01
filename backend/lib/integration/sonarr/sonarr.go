package sonarr

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
	"time"
)

// SonarrIntegration Sonarr剧集管理集成
type SonarrIntegration struct {
	*integration.BaseIntegration
}

// New 创建Sonarr集成实例
func New(id, name, url string, secrets map[string]string) *SonarrIntegration {
	return &SonarrIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindSonarr), url, secrets),
	}
}

// TestConnection 测试Sonarr连接
func (s *SonarrIntegration) TestConnection(ctx context.Context) error {
	apiKey := s.GetSecret("apiKey")
	if apiKey == "" {
		return fmt.Errorf("API密钥未配置")
	}

	url := s.BuildURL("/api/v3/system/status")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("X-Api-Key", apiKey)

	resp, err := s.Client.Do(req)
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
func (s *SonarrIntegration) GetCalendar(ctx context.Context, start, end time.Time, includeUnmonitored bool) ([]CalendarEvent, error) {
	apiKey := s.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	url := s.BuildURL("/api/v3/calendar")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	// 添加查询参数
	q := req.URL.Query()
	q.Add("start", start.Format(time.RFC3339))
	q.Add("end", end.Format(time.RFC3339))
	q.Add("unmonitored", fmt.Sprintf("%t", includeUnmonitored))
	q.Add("includeSeries", "true")
	q.Add("includeEpisodeFile", "true")
	q.Add("includeEpisodeImages", "true")
	req.URL.RawQuery = q.Encode()

	req.Header.Set("X-Api-Key", apiKey)

	resp, err := s.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取日历失败: HTTP %d", resp.StatusCode)
	}

	var sonarrEvents []SonarrCalendarEvent
	if err := json.NewDecoder(resp.Body).Decode(&sonarrEvents); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	// 转换为统一格式
	result := make([]CalendarEvent, 0, len(sonarrEvents))
	for _, event := range sonarrEvents {
		bestImage := chooseBestImage(event)
		imageURL := ""
		if bestImage != nil {
			imageURL = bestImage.RemoteURL
		}

		calEvent := CalendarEvent{
			Title:       event.Title,
			SubTitle:    event.Series.Title,
			Description: event.Series.Overview,
			StartDate:   event.AirDateUTC,
			ImageURL:    imageURL,
			Season:      event.SeasonNumber,
			Episode:     event.EpisodeNumber,
			SeriesSlug:  event.Series.TitleSlug,
			IMDbID:      event.Series.IMDbID,
		}

		result = append(result, calEvent)
	}

	return result, nil
}

// GetSeries 获取所有剧集
func (s *SonarrIntegration) GetSeries(ctx context.Context) ([]Series, error) {
	apiKey := s.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	url := s.BuildURL("/api/v3/series")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-Api-Key", apiKey)

	resp, err := s.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取剧集列表失败: HTTP %d", resp.StatusCode)
	}

	var sonarrSeries []SonarrSeries
	if err := json.NewDecoder(resp.Body).Decode(&sonarrSeries); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	// 转换为统一格式
	result := make([]Series, 0, len(sonarrSeries))
	for _, s := range sonarrSeries {
		posterURL := ""
		for _, img := range s.Images {
			if img.CoverType == "poster" {
				posterURL = img.RemoteURL
				break
			}
		}

		series := Series{
			ID:        s.ID,
			Title:     s.Title,
			TitleSlug: s.TitleSlug,
			Status:    s.Status,
			Overview:  s.Overview,
			Network:   s.Network,
			Year:      s.Year,
			Seasons:   len(s.Seasons),
			PosterURL: posterURL,
			IMDbID:    s.IMDbID,
			TVDbID:    s.TVDbID,
			Rating:    s.Ratings.Value,
			Monitored: s.Monitored,
		}

		result = append(result, series)
	}

	return result, nil
}

// GetQueue 获取下载队列
func (s *SonarrIntegration) GetQueue(ctx context.Context) ([]QueueItem, error) {
	apiKey := s.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	url := s.BuildURL("/api/v3/queue")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-Api-Key", apiKey)

	resp, err := s.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取队列失败: HTTP %d", resp.StatusCode)
	}

	var queueResponse struct {
		Records []SonarrQueueItem `json:"records"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&queueResponse); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	// 转换为统一格式
	result := make([]QueueItem, 0, len(queueResponse.Records))
	for _, item := range queueResponse.Records {
		queueItem := QueueItem{
			ID:                    item.ID,
			SeriesTitle:           item.Series.Title,
			EpisodeTitle:          item.Episode.Title,
			Season:                item.Episode.SeasonNumber,
			Episode:               item.Episode.EpisodeNumber,
			Quality:               item.Quality.Quality.Name,
			Size:                  item.Size,
			SizeLeft:              item.Sizeleft,
			Status:                item.Status,
			TrackedDownloadStatus: item.TrackedDownloadStatus,
			ErrorMessage:          item.ErrorMessage,
		}

		result = append(result, queueItem)
	}

	return result, nil
}

// SearchSeries 搜索剧集
func (s *SonarrIntegration) SearchSeries(ctx context.Context, query string) ([]SearchResult, error) {
	apiKey := s.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	url := s.BuildURL("/api/v3/series/lookup")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	q := req.URL.Query()
	q.Add("term", query)
	req.URL.RawQuery = q.Encode()

	req.Header.Set("X-Api-Key", apiKey)

	resp, err := s.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("搜索失败: HTTP %d", resp.StatusCode)
	}

	var sonarrResults []SonarrSearchResult
	if err := json.NewDecoder(resp.Body).Decode(&sonarrResults); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	// 转换为统一格式
	result := make([]SearchResult, 0, len(sonarrResults))
	for _, sr := range sonarrResults {
		posterURL := ""
		for _, img := range sr.Images {
			if img.CoverType == "poster" {
				posterURL = img.RemoteURL
				break
			}
		}

		searchResult := SearchResult{
			Title:     sr.Title,
			TitleSlug: sr.TitleSlug,
			Year:      sr.Year,
			Overview:  sr.Overview,
			Network:   sr.Network,
			Status:    sr.Status,
			PosterURL: posterURL,
			IMDbID:    sr.IMDbID,
			TVDbID:    sr.TVDbID,
		}

		result = append(result, searchResult)
	}

	return result, nil
}

// chooseBestImage 选择最佳图片
func chooseBestImage(event SonarrCalendarEvent) *SonarrImage {
	// 图片优先级: poster > banner > fanart > screenshot
	priorities := []string{"poster", "banner", "fanart", "screenshot"}

	// 合并剧集图片和系列图片
	allImages := append(event.Images, event.Series.Images...)

	for _, priority := range priorities {
		for _, img := range allImages {
			if img.CoverType == priority {
				return &img
			}
		}
	}

	if len(allImages) > 0 {
		return &allImages[0]
	}

	return nil
}
