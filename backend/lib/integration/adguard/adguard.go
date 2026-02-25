package adguard

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
	"net/url"
	"strconv"
)

// AdGuardHomeIntegration AdGuard Home DNS 集成
//
// 对齐 Pi-hole 集成的行为，统一实现 DNSIntegration 接口，以便前端 DNS Widget
// 可以无差别地读取统计数据和控制过滤开关。
type AdGuardHomeIntegration struct {
	*integration.BaseIntegration
}

func New(id, name, baseURL string, secrets map[string]string) *AdGuardHomeIntegration {
	return &AdGuardHomeIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindAdGuardHome), baseURL, secrets),
	}
}

func (a *AdGuardHomeIntegration) TestConnection(ctx context.Context) error {
	u, err := url.Parse(a.GetURL())
	if err != nil {
		return err
	}
	u.Path = "/control/status"

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return err
	}
	a.applyAuth(req)

	resp, err := a.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("adguard 测试连接失败: HTTP %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return fmt.Errorf("解析 AdGuard Home 状态响应失败: %w", err)
	}

	if result == nil {
		return fmt.Errorf("AdGuard Home 状态响应无效")
	}

	return nil
}

// GetDNSStats 使用 AdGuard Home 的 /control/stats 接口
func (a *AdGuardHomeIntegration) GetDNSStats(ctx context.Context) (*integration.DNSStats, error) {
	u, err := url.Parse(a.GetURL())
	if err != nil {
		return nil, err
	}
	u.Path = "/control/stats"

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}
	a.applyAuth(req)

	resp, err := a.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取 AdGuard Home 统计失败: HTTP %d", resp.StatusCode)
	}

	var raw adGuardStatsResponse
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, fmt.Errorf("解析 AdGuard Home 响应失败: %w", err)
	}

	var queriesTotal, queriesBlocked, domainsBlocked, clientsActive int
	var blockRate float64

	// stats.num_dns_queries
	if v, ok := raw.Stats["num_dns_queries"]; ok {
		queriesTotal = int(v)
	}
	// stats.num_blocked_filtering
	if v, ok := raw.Stats["num_blocked_filtering"]; ok {
		queriesBlocked = int(v)
	}
	// stats.avg_processing_time - not needed; use ratio instead
	if queriesTotal > 0 {
		blockRate = float64(queriesBlocked) / float64(queriesTotal) * 100
	}

	// num_blocked_domains
	domainsBlocked = raw.NumBlockedFilter

	// 获取客户端数量
	if len(raw.TopClients) > 0 {
		clientsActive = len(raw.TopClients)
	}

	return &integration.DNSStats{
		QueriesTotal:   queriesTotal,
		QueriesBlocked: queriesBlocked,
		BlockRate:      blockRate,
		ClientsActive:  clientsActive,
		DomainsBlocked: domainsBlocked,
	}, nil
}

func (a *AdGuardHomeIntegration) EnableFiltering(ctx context.Context) error {
	return a.callFilteringAPI(ctx, true, 0)
}

func (a *AdGuardHomeIntegration) DisableFiltering(ctx context.Context, duration int) error {
	return a.callFilteringAPI(ctx, false, duration)
}

// callFilteringAPI 调用 /control/filtering 以启用/禁用过滤
func (a *AdGuardHomeIntegration) callFilteringAPI(ctx context.Context, enabled bool, duration int) error {
	u, err := url.Parse(a.GetURL())
	if err != nil {
		return err
	}
	u.Path = "/control/filtering"

	q := u.Query()
	q.Set("enabled", strconv.FormatBool(enabled))
	if !enabled && duration > 0 {
		q.Set("duration", strconv.Itoa(duration))
	}
	u.RawQuery = q.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u.String(), nil)
	if err != nil {
		return err
	}
	a.applyAuth(req)

	resp, err := a.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("调用 AdGuard Home 过滤接口失败: HTTP %d", resp.StatusCode)
	}

	return nil
}

// adGuardStatsResponse 对应 /control/stats 的部分字段
type adGuardStatsResponse struct {
	NumBlockedFilter int                `json:"num_blocked_filtering"`
	Stats            map[string]float64 `json:"stats"`
	TopClients       []struct {
		Name  string  `json:"name"`
		Count float64 `json:"count"`
	} `json:"top_clients"`
}

// applyAuth 根据集成中配置的 username/password 或 token 对请求添加认证
func (a *AdGuardHomeIntegration) applyAuth(req *http.Request) {
	if token := a.GetSecret("token"); token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
		return
	}
	username := a.GetSecret("username")
	password := a.GetSecret("password")
	if username != "" {
		req.SetBasicAuth(username, password)
	}
}
