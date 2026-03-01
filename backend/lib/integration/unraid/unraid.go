package unraid

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
	"time"
)

type UnraidIntegration struct {
	*integration.BaseIntegration
}

func New(id, name, baseURL string, secrets map[string]string) *UnraidIntegration {
	return &UnraidIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindUnraid), baseURL, secrets),
	}
}

func (u *UnraidIntegration) TestConnection(ctx context.Context) error {
	_, err := u.fetchSystemInfo(ctx)
	if err != nil {
		return fmt.Errorf("unraid 测试连接失败: %w", err)
	}
	return nil
}

func (u *UnraidIntegration) GetSystemHealth(ctx context.Context) (*integration.SystemHealth, error) {
	info, err := u.fetchSystemInfo(ctx)
	if err != nil {
		return nil, err
	}

	cpuPercent := info.Metrics.CPU.PercentTotal

	var totalMemory int64
	for _, m := range info.Info.Memory.Layout {
		totalMemory += int64(m.Size)
	}

	memPercent := info.Metrics.Memory.PercentTotal
	usedMemory := int64(float64(totalMemory) * memPercent / 100)

	diskTotal := int64(info.Array.Capacity.Disks.Total)
	diskUsed := int64(info.Array.Capacity.Disks.Used)

	var diskPercent float64
	if diskTotal > 0 {
		diskPercent = float64(diskUsed) / float64(diskTotal) * 100
	}

	var uptimeSeconds int64
	if !info.Info.OS.Uptime.IsZero() {
		uptimeSeconds = int64(time.Since(info.Info.OS.Uptime).Seconds())
		if uptimeSeconds < 0 {
			uptimeSeconds = 0
		}
	}

	return &integration.SystemHealth{
		CPUPercent:    cpuPercent,
		MemoryPercent: memPercent,
		MemoryUsed:    usedMemory,
		MemoryTotal:   totalMemory,
		DiskPercent:   diskPercent,
		DiskUsed:      diskUsed,
		DiskTotal:     diskTotal,
		Uptime:        uptimeSeconds,
		Temperature:   0,
	}, nil
}

type unraidSystemInfo struct {
	Metrics struct {
		CPU struct {
			PercentTotal float64 `json:"percentTotal"`
		} `json:"cpu"`
		Memory struct {
			PercentTotal float64 `json:"percentTotal"`
		} `json:"memory"`
	} `json:"metrics"`
	Array struct {
		Capacity struct {
			Disks struct {
				Free  float64 `json:"free"`
				Total float64 `json:"total"`
				Used  float64 `json:"used"`
			} `json:"disks"`
		} `json:"capacity"`
	} `json:"array"`
	Info struct {
		OS struct {
			Uptime time.Time `json:"uptime"`
		} `json:"os"`
		Memory struct {
			Layout []struct {
				Size float64 `json:"size"`
			} `json:"layout"`
		} `json:"memory"`
	} `json:"info"`
}

type unraidGraphQLResponse struct {
	Data   unraidSystemInfo `json:"data"`
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors,omitempty"`
}

func (u *UnraidIntegration) fetchSystemInfo(ctx context.Context) (*unraidSystemInfo, error) {
	query := `
      query {
        metrics {
          cpu {
            percentTotal
          }
          memory {
            percentTotal
          }
        }
        array {
          capacity {
            disks {
              free
              total
              used
            }
          }
        }
        info {
          os {
            uptime
          }
          memory {
            layout {
              size
            }
          }
        }
      }
    `

	body := map[string]string{
		"query": query,
	}

	data, err := json.Marshal(body)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, u.BuildURL("/graphql"), bytes.NewReader(data))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	apiKey := u.GetSecret("apiKey")
	if apiKey == "" {
		apiKey = u.GetSecret("token")
	}
	if apiKey != "" {
		req.Header.Set("x-api-key", apiKey)
	}

	resp, err := u.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("获取 Unraid 系统信息失败: HTTP %d", resp.StatusCode)
	}

	var result unraidGraphQLResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("解析 Unraid 响应失败: %w", err)
	}

	if len(result.Errors) > 0 {
		return nil, fmt.Errorf("Unraid GraphQL 错误: %s", result.Errors[0].Message)
	}

	return &result.Data, nil
}
