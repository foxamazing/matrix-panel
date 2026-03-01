package uptimekuma

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// UptimeKumaIntegration represents an Uptime Kuma integration
type UptimeKumaIntegration struct {
	*integration.BaseIntegration
}

// MonitorStatus represents a monitor's status
type MonitorStatus struct {
	ID            int     `json:"id"`
	Name          string  `json:"name"`
	URL           string  `json:"url"`
	Type          string  `json:"type"`
	Active        bool    `json:"active"`
	UptimePercent float64 `json:"uptime"`
	Heartbeat     struct {
		Status int    `json:"status"`
		Msg    string `json:"msg"`
		Ping   int    `json:"ping"`
		Time   string `json:"time"`
	} `json:"heartbeat"`
}

// New 创建 Uptime Kuma 集成实例
func New(id, name, url string, secrets map[string]string) *UptimeKumaIntegration {
	return &UptimeKumaIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "uptimekuma", url, secrets),
	}
}

// TestConnection tests the Uptime Kuma connection
func (u *UptimeKumaIntegration) TestConnection(ctx context.Context) error {
	url := u.BuildURL("/api/status-page/heartbeat")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return err
	}

	resp, err := u.Client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to connect to Uptime Kuma: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNotFound {
		return fmt.Errorf("Uptime Kuma returned status code %d", resp.StatusCode)
	}

	return nil
}

// GetMonitors retrieves all monitors
func (u *UptimeKumaIntegration) GetMonitors(ctx context.Context) ([]MonitorStatus, error) {
	url := u.BuildURL("/api/status-page")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := u.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get monitors: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Uptime Kuma returned status code %d", resp.StatusCode)
	}

	var result struct {
		PublicGroupList []struct {
			MonitorList []MonitorStatus `json:"monitorList"`
		} `json:"publicGroupList"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode monitors: %w", err)
	}

	var monitors []MonitorStatus
	for _, group := range result.PublicGroupList {
		monitors = append(monitors, group.MonitorList...)
	}

	return monitors, nil
}
