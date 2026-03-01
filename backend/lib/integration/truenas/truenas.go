package truenas

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// TrueNASIntegration TrueNAS 存储/系统监控集成
//
// 设计目标与 Proxmox 一致：实现 HealthMonitoringIntegration，用于 SystemMonitor Widget 通过 integrationId
// 拉取远程主机的 CPU / 内存 / 磁盘等基础信息。
type TrueNASIntegration struct {
	*integration.BaseIntegration
}

func New(id, name, url string, secrets map[string]string) *TrueNASIntegration {
	return &TrueNASIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindTrueNAS), url, secrets),
	}
}

// TestConnection 调用一个较轻量的 TrueNAS 接口，验证凭据和连通性
func (t *TrueNASIntegration) TestConnection(ctx context.Context) error {
	_, err := t.fetchSystemInfo(ctx)
	if err != nil {
		return fmt.Errorf("truenas 测试连接失败: %w", err)
	}
	return nil
}

// GetSystemHealth 将 TrueNAS 的系统信息转换为通用 SystemHealth 结构
func (t *TrueNASIntegration) GetSystemHealth(ctx context.Context) (*integration.SystemHealth, error) {
	info, err := t.fetchSystemInfo(ctx)
	if err != nil {
		return nil, err
	}

	var cpuPercent float64
	if len(info.CPUUsage) > 0 {
		var sum float64
		for _, v := range info.CPUUsage {
			sum += v
		}
		cpuPercent = sum / float64(len(info.CPUUsage))
	}

	var memPercent float64
	if info.MemoryTotal > 0 {
		memPercent = float64(info.MemoryUsed) / float64(info.MemoryTotal) * 100
	}

	var diskPercent float64
	if info.ZpoolSize > 0 {
		diskPercent = float64(info.ZpoolUsed) / float64(info.ZpoolSize) * 100
	}

	return &integration.SystemHealth{
		CPUPercent:    cpuPercent,
		MemoryPercent: memPercent,
		MemoryUsed:    info.MemoryUsed,
		MemoryTotal:   info.MemoryTotal,
		DiskPercent:   diskPercent,
		DiskUsed:      info.ZpoolUsed,
		DiskTotal:     info.ZpoolSize,
		Uptime:        info.Uptime,
		Temperature:   0,
	}, nil
}

// trueNASSystemInfo 对应 TrueNAS /api/v2.0/system/info 中部分字段
type trueNASSystemInfo struct {
	Uptime      int64     `json:"uptime"`
	CPUUsage    []float64 `json:"cpu_usage"`
	MemoryTotal int64     `json:"physmem"`
	MemoryUsed  int64     `json:"memory_used"`
	ZpoolSize   int64     `json:"zpool_size"`
	ZpoolUsed   int64     `json:"zpool_used"`
}

// fetchSystemInfo 从 TrueNAS API 拉取系统信息
func (t *TrueNASIntegration) fetchSystemInfo(ctx context.Context) (*trueNASSystemInfo, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, t.BuildURL("/api/v2.0/system/info"), nil)
	if err != nil {
		return nil, err
	}

	// TrueNAS 默认使用 Basic Auth；Homarr 文档要求使用用户名/密码
	username := t.GetSecret("username")
	password := t.GetSecret("password")
	if username != "" {
		req.SetBasicAuth(username, password)
	}

	resp, err := t.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("获取 TrueNAS 系统信息失败: HTTP %d", resp.StatusCode)
	}

	var info trueNASSystemInfo
	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		return nil, fmt.Errorf("解析 TrueNAS 响应失败: %w", err)
	}

	return &info, nil
}
