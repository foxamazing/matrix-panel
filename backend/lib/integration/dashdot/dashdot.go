package dashdot

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// DashdotIntegration represents a Dashdot system monitoring integration
type DashdotIntegration struct {
	*integration.BaseIntegration
}

// DashdotStats represents system statistics from Dashdot
type DashdotStats struct {
	CPU struct {
		Brand     string  `json:"brand"`
		Model     string  `json:"model"`
		Cores     int     `json:"cores"`
		Threads   int     `json:"threads"`
		Load      float64 `json:"load"`      // 0-100
		Temp      float64 `json:"temp"`      // Celsius
		Frequency float64 `json:"frequency"` // MHz
	} `json:"cpu"`

	RAM struct {
		Total     uint64  `json:"total"`     // Bytes
		Used      uint64  `json:"used"`      // Bytes
		Available uint64  `json:"available"` // Bytes
		Percent   float64 `json:"percent"`   // 0-100
	} `json:"ram"`

	Storage []struct {
		Device    string  `json:"device"`
		Mount     string  `json:"mount"`
		Total     uint64  `json:"total"`     // Bytes
		Used      uint64  `json:"used"`      // Bytes
		Available uint64  `json:"available"` // Bytes
		Percent   float64 `json:"percent"`   // 0-100
	} `json:"storage"`

	Network []struct {
		Interface string `json:"interface"`
		Type      string `json:"type"`
		SpeedUp   uint64 `json:"speedUp"`   // Bytes/s
		SpeedDown uint64 `json:"speedDown"` // Bytes/s
	} `json:"network"`

	Uptime int64 `json:"uptime"` // Seconds
}

// New 创建 Dashdot 集成实例
func New(id, name, url string, secrets map[string]string) *DashdotIntegration {
	return &DashdotIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, "dashdot", url, secrets),
	}
}

// TestConnection tests the connection to Dashdot
func (d *DashdotIntegration) TestConnection(ctx context.Context) error {
	url := d.BuildURL("/api/info")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return err
	}

	resp, err := d.Client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to connect to Dashdot: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("Dashdot returned status code %d", resp.StatusCode)
	}

	return nil
}

// GetStats retrieves system statistics from Dashdot
func (d *DashdotIntegration) GetStats(ctx context.Context) (*DashdotStats, error) {
	url := d.BuildURL("/api/info")
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := d.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get stats from Dashdot: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Dashdot returned status code %d", resp.StatusCode)
	}

	var stats DashdotStats
	if err := json.NewDecoder(resp.Body).Decode(&stats); err != nil {
		return nil, fmt.Errorf("failed to decode Dashdot response: %w", err)
	}

	return &stats, nil
}
