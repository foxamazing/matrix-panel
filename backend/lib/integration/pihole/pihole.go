package pihole

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
	"net/url"
	"strconv"
)

type PiHoleIntegration struct {
	*integration.BaseIntegration
}

func New(id, name, baseURL string, secrets map[string]string) *PiHoleIntegration {
	return &PiHoleIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindPiHole), baseURL, secrets),
	}
}

func (p *PiHoleIntegration) TestConnection(ctx context.Context) error {
	apiToken := p.getAPIToken()
	if apiToken == "" {
		return fmt.Errorf("pihole 未配置 apiToken")
	}

	u, err := url.Parse(p.GetURL())
	if err != nil {
		return err
	}
	u.Path = "/admin/api.php"
	q := u.Query()
	q.Set("status", "")
	q.Set("auth", apiToken)
	u.RawQuery = q.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return err
	}

	resp, err := p.Client.Do(req)
	if err != nil {
		return fmt.Errorf("pihole 测试连接失败: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("pihole 连接失败: HTTP %d", resp.StatusCode)
	}

	var data interface{}
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return fmt.Errorf("解析 Pi-hole 状态失败: %w", err)
	}

	if _, ok := data.(map[string]interface{}); !ok {
		return fmt.Errorf("pihole 认证失败")
	}

	return nil
}

func (p *PiHoleIntegration) GetDNSStats(ctx context.Context) (*integration.DNSStats, error) {
	apiToken := p.getAPIToken()
	if apiToken == "" {
		return nil, fmt.Errorf("pihole 未配置 apiToken")
	}

	u, err := url.Parse(p.GetURL())
	if err != nil {
		return nil, err
	}
	u.Path = "/admin/api.php"
	q := u.Query()
	q.Set("summaryRaw", "")
	q.Set("auth", apiToken)
	u.RawQuery = q.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, err
	}

	resp, err := p.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取 Pi-hole 统计失败: HTTP %d", resp.StatusCode)
	}

	var raw map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, fmt.Errorf("解析 Pi-hole 响应失败: %w", err)
	}

	parseInt := func(key string) int {
		v, ok := raw[key]
		if !ok {
			return 0
		}
		switch t := v.(type) {
		case float64:
			return int(t)
		case string:
			n, _ := strconv.Atoi(t)
			return n
		default:
			return 0
		}
	}

	parseFloat := func(key string) float64 {
		v, ok := raw[key]
		if !ok {
			return 0
		}
		switch t := v.(type) {
		case float64:
			return t
		case string:
			f, _ := strconv.ParseFloat(t, 64)
			return f
		default:
			return 0
		}
	}

	stats := &integration.DNSStats{
		QueriesTotal:   parseInt("dns_queries_today"),
		QueriesBlocked: parseInt("ads_blocked_today"),
		BlockRate:      parseFloat("ads_percentage_today"),
		ClientsActive:  parseInt("clients_ever_seen"),
		DomainsBlocked: parseInt("domains_being_blocked"),
	}

	return stats, nil
}

func (p *PiHoleIntegration) EnableFiltering(ctx context.Context) error {
	return p.callToggleAPI(ctx, "enable", 0)
}

func (p *PiHoleIntegration) DisableFiltering(ctx context.Context, duration int) error {
	return p.callToggleAPI(ctx, "disable", duration)
}

func (p *PiHoleIntegration) callToggleAPI(ctx context.Context, action string, duration int) error {
	apiToken := p.getAPIToken()
	if apiToken == "" {
		return fmt.Errorf("pihole 未配置 apiToken")
	}

	u, err := url.Parse(p.GetURL())
	if err != nil {
		return err
	}
	u.Path = "/admin/api.php"
	q := u.Query()
	q.Set(action, "")
	if duration > 0 && action == "disable" {
		q.Set("duration", strconv.Itoa(duration))
	}
	q.Set("auth", apiToken)
	u.RawQuery = q.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return err
	}

	resp, err := p.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("调用 Pi-hole %s 失败: HTTP %d", action, resp.StatusCode)
	}

	return nil
}

func (p *PiHoleIntegration) getAPIToken() string {
	if v := p.GetSecret("apiKey"); v != "" {
		return v
	}
	if v := p.GetSecret("token"); v != "" {
		return v
	}
	return ""
}
