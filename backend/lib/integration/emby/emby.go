package emby

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
	"strconv"
)

// EmbyIntegration Emby媒体服务器集成
type EmbyIntegration struct {
	*integration.BaseIntegration
}

// New 创建Emby集成实例
func New(id, name, url string, secrets map[string]string) *EmbyIntegration {
	return &EmbyIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindEmby), url, secrets),
	}
}

// EmbySession 内部结构体用于解析API响应
type EmbySession struct {
	Id             string `json:"Id"`
	UserName       string `json:"UserName"`
	DeviceName     string `json:"DeviceName"`
	NowPlayingItem *struct {
		Name         string `json:"Name"`
		Type         string `json:"Type"`
		RunTimeTicks int64  `json:"RunTimeTicks"`
	} `json:"NowPlayingItem"`
	PlayState *struct {
		PositionTicks int64 `json:"PositionTicks"`
		IsPaused      bool  `json:"IsPaused"`
	} `json:"PlayState"`
}

// EmbyItem 内部结构体用于解析最近添加项目
type EmbyItem struct {
	Id              string   `json:"Id"`
	Name            string   `json:"Name"`
	Type            string   `json:"Type"`
	ProductionYear  int      `json:"ProductionYear"`
	CommunityRating float64  `json:"CommunityRating"`
	Overview        string   `json:"Overview"`
	RunTimeTicks    int64    `json:"RunTimeTicks"`
	DateCreated     string   `json:"DateCreated"`
	Genres          []string `json:"Genres"`
}

// TestConnection 测试Emby连接
func (e *EmbyIntegration) TestConnection(ctx context.Context) error {
	apiKey := e.GetSecret("apiKey")
	if apiKey == "" {
		return fmt.Errorf("API密钥未配置")
	}

	url := e.BuildURL("/System/Ping")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("X-Emby-Token", apiKey)
	req.Header.Set("Authorization", `Emby Client="Dashboard", Device="Homarr", DeviceId="homarr-emby-integration", Version="0.0.1"`)

	resp, err := e.Client.Do(req)
	if err != nil {
		return fmt.Errorf("连接失败: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("服务器返回错误状态: %d", resp.StatusCode)
	}

	return nil
}

// GetCurrentSessions 获取当前播放会话
func (e *EmbyIntegration) GetCurrentSessions(ctx context.Context, limit int) ([]integration.StreamSession, error) {
	apiKey := e.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	url := e.BuildURL("/Sessions")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-Emby-Token", apiKey)

	resp, err := e.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取会话失败: HTTP %d", resp.StatusCode)
	}

	var sessions []EmbySession
	if err := json.NewDecoder(resp.Body).Decode(&sessions); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	// 转换为统一格式，过滤空会话
	result := make([]integration.StreamSession, 0)
	for _, s := range sessions {
		if s.NowPlayingItem != nil {
			session := integration.StreamSession{
				SessionID:  s.Id,
				Username:   s.UserName,
				ItemName:   s.NowPlayingItem.Name,
				ItemType:   s.NowPlayingItem.Type,
				DeviceName: s.DeviceName,
				IsPaused:   s.PlayState != nil && s.PlayState.IsPaused,
			}

			// 添加播放进度信息
			if s.PlayState != nil {
				session.Progress = int(s.PlayState.PositionTicks / 10000000) // 转换为秒
			}
			if s.NowPlayingItem.RunTimeTicks > 0 {
				session.Duration = int(s.NowPlayingItem.RunTimeTicks / 10000000)
			}

			result = append(result, session)
			if limit > 0 && len(result) >= limit {
				break
			}
		}
	}

	return result, nil
}

// GetRecentlyAdded 获取最近添加的媒体
func (e *EmbyIntegration) GetRecentlyAdded(ctx context.Context, limit int) ([]integration.MediaItem, error) {
	apiKey := e.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	// 构建查询参数
	if limit <= 0 {
		limit = 20
	}

	// Items/Latest endpoint is common for recent items
	urlStr := e.BuildURL("/Items")
	req, err := http.NewRequestWithContext(ctx, "GET", urlStr, nil)
	if err != nil {
		return nil, err
	}

	q := req.URL.Query()
	q.Add("Recursive", "true")
	q.Add("SortBy", "DateCreated")
	q.Add("SortOrder", "Descending")
	q.Add("Limit", strconv.Itoa(limit))
	q.Add("IncludeItemTypes", "Movie,Episode,Series") // Focus on main media types
	req.URL.RawQuery = q.Encode()

	req.Header.Set("X-Emby-Token", apiKey)

	resp, err := e.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取最近添加失败: HTTP %d", resp.StatusCode)
	}

	var response struct {
		Items []EmbyItem `json:"Items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	var result []integration.MediaItem
	for _, item := range response.Items {
		mediaItem := integration.MediaItem{
			ID:          item.Id,
			Name:        item.Name,
			Type:        mapMediaType(item.Type),
			Year:        item.ProductionYear,
			Rating:      item.CommunityRating,
			Description: item.Overview,
			Genres:      item.Genres,
			AddedAt:     item.DateCreated,
		}

		// Image URL construction
		// Emby images usually at /Items/{Id}/Images/Primary
		mediaItem.PosterURL = e.BuildURL(fmt.Sprintf("/Items/%s/Images/Primary", item.Id))
		mediaItem.BackdropURL = e.BuildURL(fmt.Sprintf("/Items/%s/Images/Backdrop", item.Id))

		result = append(result, mediaItem)
	}

	return result, nil
}

func mapMediaType(itemType string) string {
	switch itemType {
	case "Movie":
		return "movie"
	case "Series", "Season", "Episode":
		return "tv"
	case "Audio", "MusicAlbum", "AudioBook":
		return "music"
	case "Book":
		return "book"
	case "Video":
		return "video"
	default:
		return "unknown"
	}
}
