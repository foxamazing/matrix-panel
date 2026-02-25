package system_monitor

import (
	"context"
	"fmt"
	"math"
	"matrix-panel/lib/integration"
	"runtime"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
)

// SystemMonitorIntegration 系统监控集成
type SystemMonitorIntegration struct {
	*integration.BaseIntegration
}

// New 创建系统监控集成实例
func New(id, name string, secrets map[string]string) *SystemMonitorIntegration {
	return &SystemMonitorIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindSystemMonitor), "local", secrets),
	}
}

// TestConnection 测试连接 (本地检查)
func (s *SystemMonitorIntegration) TestConnection(ctx context.Context) error {
	_, err := host.InfoWithContext(ctx)
	if err != nil {
		return fmt.Errorf("无法获取主机信息: %w", err)
	}
	return nil
}

// GetSystemHealth 获取系统健康状态
func (s *SystemMonitorIntegration) GetSystemHealth(ctx context.Context) (*integration.SystemHealth, error) {
	// 1. CPU Usage
	cpuPercent, err := cpu.PercentWithContext(ctx, 0, false)
	if err != nil {
		return nil, fmt.Errorf("failed to get cpu percent: %w", err)
	}
	cpuUsage := 0.0
	if len(cpuPercent) > 0 {
		cpuUsage = cpuPercent[0]
	}

	// 2. Memory Usage
	vMem, err := mem.VirtualMemoryWithContext(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get memory info: %w", err)
	}

	// 3. Disk Usage (Root path)
	diskPath := "/"
	if runtime.GOOS == "windows" {
		diskPath = "C:"
	}

	diskUsage, err := disk.UsageWithContext(ctx, diskPath)

	diskUsed := uint64(0)
	diskTotal := uint64(0)
	diskPercent := 0.0

	if err == nil && diskUsage != nil {
		diskUsed = diskUsage.Used
		diskTotal = diskUsage.Total
		diskPercent = diskUsage.UsedPercent
	}

	// 4. Uptime
	uptime, err := host.UptimeWithContext(ctx)
	if err != nil {
		uptime = 0
	}

	// 5. Temperature
	temp := 0.0
	temps, _ := host.SensorsTemperaturesWithContext(ctx)
	if len(temps) > 0 {
		temp = temps[0].Temperature
	}

	if math.IsNaN(cpuUsage) {
		cpuUsage = 0
	}
	if math.IsNaN(diskPercent) {
		diskPercent = 0
	}

	return &integration.SystemHealth{
		CPUPercent:    cpuUsage,
		MemoryPercent: vMem.UsedPercent,
		MemoryUsed:    int64(vMem.Used),
		MemoryTotal:   int64(vMem.Total),
		DiskPercent:   diskPercent,
		DiskUsed:      int64(diskUsed),
		DiskTotal:     int64(diskTotal),
		Uptime:        int64(uptime),
		Temperature:   temp,
	}, nil
}
