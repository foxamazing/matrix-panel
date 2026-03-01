package jellyfin

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// JellyfinIntegration Jellyfin媒体服务器集成
type JellyfinIntegration struct {
	*integration.BaseIntegration
}

// New 创建Jellyfin集成实例
func New(id, name, url string, secrets map[string]string) *JellyfinIntegration {
	return &JellyfinIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindJellyfin), url, secrets),
	}
}

// TestConnection 测试Jellyfin连接
func (j *JellyfinIntegration) TestConnection(ctx context.Context) error {
	apiKey := j.GetSecret("apiKey")
	if apiKey == "" {
		return fmt.Errorf("API密钥未配置")
	}

	url := j.BuildURL("/System/Ping")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("X-MediaBrowser-Token", apiKey)

	resp, err := j.Client.Do(req)
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
func (j *JellyfinIntegration) GetCurrentSessions(ctx context.Context, limit int) ([]integration.StreamSession, error) {
	apiKey := j.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	url := j.BuildURL("/Sessions")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-MediaBrowser-Token", apiKey)

	resp, err := j.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取会话失败: HTTP %d", resp.StatusCode)
	}

	var sessions []JellyfinSession
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
func (j *JellyfinIntegration) GetRecentlyAdded(ctx context.Context, limit int) ([]integration.MediaItem, error) {
	apiKey := j.GetSecret("apiKey")
	if apiKey == "" {
		return nil, fmt.Errorf("API密钥未配置")
	}

	userId := j.GetSecret("userId")
	if userId == "" {
		// 如果没有配置userId，尝试获取第一个用户
		var err error
		userId, err = j.getFirstUserId(ctx)
		if err != nil {
			return nil, fmt.Errorf("获取用户ID失败: %w", err)
		}
	}

	url := j.BuildURL(fmt.Sprintf("/Users/%s/Items/Latest", userId))
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-MediaBrowser-Token", apiKey)

	// 添加查询参数
	q := req.URL.Query()
	q.Add("Limit", fmt.Sprintf("%d", limit))
	q.Add("Fields", "PrimaryImageAspectRatio,BasicSyncInfo,Path,Genres")
	q.Add("ImageTypeLimit", "1")
	q.Add("EnableImageTypes", "Primary,Backdrop,Thumb")
	req.URL.RawQuery = q.Encode()

	resp, err := j.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取媒体失败: HTTP %d", resp.StatusCode)
	}

	var items []JellyfinItem
	if err := json.NewDecoder(resp.Body).Decode(&items); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	// 转换为统一格式
	result := make([]integration.MediaItem, 0, len(items))
	for _, item := range items {
		mediaItem := integration.MediaItem{
			ID:          item.Id,
			Name:        item.Name,
			Type:        mapMediaType(item.Type),
			Year:        item.ProductionYear,
			Rating:      item.CommunityRating,
			Description: item.Overview,
		}

		// 构建图片URL
		if item.ImageTags.Primary != "" {
			mediaItem.PosterURL = j.BuildURL(fmt.Sprintf("/Items/%s/Images/Primary", item.Id))
		}
		if item.BackdropImageTags != nil && len(item.BackdropImageTags) > 0 {
			mediaItem.BackdropURL = j.BuildURL(fmt.Sprintf("/Items/%s/Images/Backdrop/0", item.Id))
		}

		// 添加类型标签
		if item.Genres != nil {
			mediaItem.Genres = item.Genres
		}

		// 添加时间
		if item.DateCreated != "" {
			mediaItem.AddedAt = item.DateCreated
		}

		result = append(result, mediaItem)
	}

	return result, nil
}

// getFirstUserId 获取第一个用户ID
func (j *JellyfinIntegration) getFirstUserId(ctx context.Context) (string, error) {
	apiKey := j.GetSecret("apiKey")
	url := j.BuildURL("/Users")

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return "", err
	}

	req.Header.Set("X-MediaBrowser-Token", apiKey)

	resp, err := j.Client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var users []struct {
		Id string `json:"Id"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&users); err != nil {
		return "", err
	}

	if len(users) == 0 {
		return "", fmt.Errorf("未找到用户")
	}

	return users[0].Id, nil
}

// mapMediaType 映射媒体类型
func mapMediaType(itemType string) string {
	switch itemType {
	case "Movie":
		return "movie"
	case "Series", "Season", "Episode":
		return "tv"
	case "Audio", "MusicAlbum":
		return "music"
	default:
		return "unknown"
	}
}

// Jellyfin API 数据结构

type JellyfinSession struct {
	Id             string               `json:"Id"`
	UserId         string               `json:"UserId"`
	UserName       string               `json:"UserName"`
	DeviceName     string               `json:"DeviceName"`
	NowPlayingItem *JellyfinPlayingItem `json:"NowPlayingItem"`
	PlayState      *JellyfinPlayState   `json:"PlayState"`
}

type JellyfinPlayingItem struct {
	Name         string `json:"Name"`
	Type         string `json:"Type"`
	RunTimeTicks int64  `json:"RunTimeTicks"`
}

type JellyfinPlayState struct {
	PositionTicks int64 `json:"PositionTicks"`
	IsPaused      bool  `json:"IsPaused"`
}

type JellyfinItem struct {
	Id                string            `json:"Id"`
	Name              string            `json:"Name"`
	Type              string            `json:"Type"`
	ProductionYear    int               `json:"ProductionYear"`
	CommunityRating   float64           `json:"CommunityRating"`
	Overview          string            `json:"Overview"`
	DateCreated       string            `json:"DateCreated"`
	Genres            []string          `json:"Genres"`
	ImageTags         JellyfinImageTags `json:"ImageTags"`
	BackdropImageTags []string          `json:"BackdropImageTags"`
}

type JellyfinImageTags struct {
	Primary string `json:"Primary"`
}
