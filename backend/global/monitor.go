package global

import (
	"matrix-panel/lib/monitor"
)

const (
	SystemMonitor_CPU_INFO    = "CPU_INFO"
	SystemMonitor_MEMORY_INFO = "MEMORY_INFO"
	SystemMonitor_DISK_INFO   = "DISK_INFO"
	SystemMonitor_GPU_INFO    = "GPU_INFO"
	SystemMonitor_POWER_INFO  = "POWER_INFO"
	SystemMonitor_DOCKER_INFO = "DOCKER_INFO"
)

type ModelSystemMonitor struct {
	CPUInfo           monitor.CPUInfo               `json:"cpuInfo"`
	DiskInfo          []monitor.DiskInfo            `json:"diskInfo"`
	NetIOCountersInfo []monitor.NetIOCountersInfo   `json:"netIOCountersInfo"`
	MemoryInfo        monitor.MemoryInfo            `json:"memoryInfo"`
	GPUInfo           []monitor.GPUInfo             `json:"gpuInfo"`
	PowerInfo         monitor.PowerInfo             `json:"powerInfo"`
	DockerInfo        []monitor.DockerContainerInfo `json:"dockerInfo"`
}
