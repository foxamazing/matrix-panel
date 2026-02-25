package plex

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
	"time"
)

// PlexIntegration Plex媒体服务器集成
type PlexIntegration struct {
	*integration.BaseIntegration
}

// New 创建Plex集成实例
func New(id, name, url string, secrets map[string]string) *PlexIntegration {
	return &PlexIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindPlex), url, secrets),
	}
}

// Plex API 响应结构
type PlexResponse struct {
	MediaContainer PlexMediaContainer `json:"MediaContainer"`
}

type PlexMediaContainer struct {
	Metadata []PlexMetadata `json:"Metadata"`
}

type PlexMetadata struct {
	RatingKey        string      `json:"ratingKey"`
	Title            string      `json:"title"`
	Type             string      `json:"type"`
	Thumb            string      `json:"thumb"`
	Art              string      `json:"art"`
	AddedAt          int64       `json:"addedAt"`
	Duration         int64       `json:"duration"`
	ViewOffset       int64       `json:"viewOffset"`
	User             *PlexUser   `json:"User,omitempty"`
	Player           *PlexPlayer `json:"Player,omitempty"`
	GrandparentTitle string      `json:"grandparentTitle"`
	ParentTitle      string      `json:"parentTitle"`
	Year             int         `json:"year"`
	Rating           float64     `json:"rating"`
	Summary          string      `json:"summary"`
}

type PlexUser struct {
	Title string `json:"title"`
}

type PlexPlayer struct {
	Title string `json:"title"`
	State string `json:"state"` // "playing", "paused", "buffering"
}

// TestConnection 测试Plex连接
func (p *PlexIntegration) TestConnection(ctx context.Context) error {
	token := p.GetSecret("apiKey") // Homarr uses apiKey/token generically
	if token == "" {
		// Try 'token' key as well
		token = p.GetSecret("token")
	}
	if token == "" {
		return fmt.Errorf("Plex Token未配置")
	}

	url := p.BuildURL("/prefs")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("X-Plex-Token", token)
	req.Header.Set("Accept", "application/json")

	resp, err := p.Client.Do(req)
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
func (p *PlexIntegration) GetCurrentSessions(ctx context.Context, limit int) ([]integration.StreamSession, error) {
	token := p.GetSecret("apiKey")
	if token == "" {
		token = p.GetSecret("token")
	}
	if token == "" {
		return nil, fmt.Errorf("Plex Token未配置")
	}

	url := p.BuildURL("/status/sessions")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-Plex-Token", token)
	req.Header.Set("Accept", "application/json")

	resp, err := p.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取会话失败: HTTP %d", resp.StatusCode)
	}

	var plexResp PlexResponse
	if err := json.NewDecoder(resp.Body).Decode(&plexResp); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	result := make([]integration.StreamSession, 0)
	for _, m := range plexResp.MediaContainer.Metadata {
		if limit > 0 && len(result) >= limit {
			break
		}

		session := integration.StreamSession{
			SessionID: m.RatingKey, // Use RatingKey or Session ID if available (Metadata usually has session info)
			ItemType:  m.Type,
			IsPaused:  m.Player != nil && m.Player.State == "paused",
			Duration:  int(m.Duration / 1000),   // ms to seconds
			Progress:  int(m.ViewOffset / 1000), // ms to seconds
		}

		if m.User != nil {
			session.Username = m.User.Title
		}
		if m.Player != nil {
			session.DeviceName = m.Player.Title
		}

		// 构建完整标题
		if m.Type == "episode" {
			session.ItemName = fmt.Sprintf("%s - %s - %s", m.GrandparentTitle, m.ParentTitle, m.Title)
		} else if m.Type == "track" {
			session.ItemName = fmt.Sprintf("%s - %s", m.GrandparentTitle, m.Title) // Artist - Song
		} else {
			session.ItemName = m.Title
		}

		result = append(result, session)
	}

	return result, nil
}

// GetRecentlyAdded 获取最近添加的媒体
func (p *PlexIntegration) GetRecentlyAdded(ctx context.Context, limit int) ([]integration.MediaItem, error) {
	token := p.GetSecret("apiKey")
	if token == "" {
		token = p.GetSecret("token")
	}
	if token == "" {
		return nil, fmt.Errorf("Plex Token未配置")
	}

	url := p.BuildURL("/library/recentlyAdded")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-Plex-Token", token)
	req.Header.Set("Accept", "application/json")

	resp, err := p.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取最近添加失败: HTTP %d", resp.StatusCode)
	}

	var plexResp PlexResponse
	if err := json.NewDecoder(resp.Body).Decode(&plexResp); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	result := make([]integration.MediaItem, 0)
	for _, m := range plexResp.MediaContainer.Metadata {
		if limit > 0 && len(result) >= limit {
			break
		}

		item := integration.MediaItem{
			ID:          m.RatingKey,
			Name:        m.Title,
			Type:        m.Type,
			Year:        m.Year,
			Rating:      m.Rating,
			Description: m.Summary,
			AddedAt:     time.Unix(m.AddedAt, 0).Format(time.RFC3339),
		}

		// 处理图片URL - Plex图片通常需要带Token访问
		// /library/metadata/{ratingKey}/thumb/{timestamp}
		// 这里简单返回thumb路径，前端可能需要代理或直接带token访问
		if m.Thumb != "" {
			item.PosterURL = p.BuildURL(m.Thumb) + "?X-Plex-Token=" + token
		}
		if m.Art != "" {
			item.BackdropURL = p.BuildURL(m.Art) + "?X-Plex-Token=" + token
		}

		result = append(result, item)
	}

	return result, nil
}
