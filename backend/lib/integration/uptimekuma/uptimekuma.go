package uptimekuma

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// UptimeKumaIntegration represents an Uptime Kuma integration
type UptimeKumaIntegration struct {
	BaseURL string
	client  *http.Client
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

// NewUptimeKumaIntegration creates a new Uptime Kuma integration
func NewUptimeKumaIntegration(baseURL string) *UptimeKumaIntegration {
	return &UptimeKumaIntegration{
		BaseURL: baseURL,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// TestConnection tests the Uptime Kuma connection
func (u *UptimeKumaIntegration) TestConnection() error {
	resp, err := u.client.Get(fmt.Sprintf("%s/api/status-page/heartbeat", u.BaseURL))
	if err != nil {
		return fmt.Errorf("failed to connect to Uptime Kuma: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNotFound {
		return fmt.Errorf("Uptime Kuma returned status code %d", resp.StatusCode)
	}

	return nil
}

// GetMonitors retrieves all monitors (simplified - actual Uptime Kuma uses WebSocket)
func (u *UptimeKumaIntegration) GetMonitors() ([]MonitorStatus, error) {
	// Note: Real Uptime Kuma uses WebSocket for real-time data
	// This is a simplified HTTP fallback or status page API
	resp, err := u.client.Get(fmt.Sprintf("%s/api/status-page", u.BaseURL))
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
