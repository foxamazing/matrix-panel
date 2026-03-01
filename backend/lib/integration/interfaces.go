package integration

import "context"

// MediaServerIntegration 媒体服务器集成接口
type MediaServerIntegration interface {
	Integration
	// 获取当前播放会话
	GetCurrentSessions(ctx context.Context, limit int) ([]StreamSession, error)
	// 获取最近添加的媒体
	GetRecentlyAdded(ctx context.Context, limit int) ([]MediaItem, error)
}

// MediaTranscodingIntegration 媒体转码集成接口（如 Tdarr）
type MediaTranscodingIntegration interface {
	Integration
	// 获取总体统计信息
	GetStatistics(ctx context.Context) (*TdarrStatistics, error)
	// 获取当前工作节点（Workers）
	GetWorkers(ctx context.Context) ([]TdarrWorker, error)
	// 获取转码/健康检查队列
	GetQueue(ctx context.Context, firstItemIndex, pageSize int) (*TdarrQueue, error)
}

// DownloadClientIntegration 下载客户端集成接口
type DownloadClientIntegration interface {
	Integration
	// 获取所有下载任务
	GetTorrents(ctx context.Context) ([]TorrentItem, error)
	// 获取客户端状态
	GetStatus(ctx context.Context) (*ClientStatus, error)
	// 暂停/恢复下载
	PauseTorrent(ctx context.Context, hash string) error
	ResumeTorrent(ctx context.Context, hash string) error
}

// HealthMonitoringIntegration 健康监控集成接口
type HealthMonitoringIntegration interface {
	Integration
	// 获取系统健康状态
	GetSystemHealth(ctx context.Context) (*SystemHealth, error)
}

// DNSIntegration DNS服务集成接口
type DNSIntegration interface {
	Integration
	// 获取DNS统计信息
	GetDNSStats(ctx context.Context) (*DNSStats, error)
	// 启用/禁用DNS过滤
	EnableFiltering(ctx context.Context) error
	DisableFiltering(ctx context.Context, duration int) error // duration in seconds
}

// DockerIntegration Docker集成接口
type DockerIntegration interface {
	Integration
	// 获取容器列表
	ListContainers(ctx context.Context) ([]DockerContainer, error)
	// 启动/停止/重启容器
	StartContainer(ctx context.Context, containerID string) error
	StopContainer(ctx context.Context, containerID string) error
	RestartContainer(ctx context.Context, containerID string) error
}

type SmartHomeIntegration interface {
	Integration
	GetEntityState(ctx context.Context, entityID string) (string, error)
	ToggleEntity(ctx context.Context, entityID string) error
	ExecuteAutomation(ctx context.Context, automationID string) error
}

// DockerContainer Docker容器信息
type DockerContainer struct {
	ID      string            `json:"id"`
	Name    string            `json:"name"`
	Image   string            `json:"image"`
	State   string            `json:"state"` // running, stopped, paused等
	Status  string            `json:"status"`
	Created string            `json:"created"`
	Ports   []DockerPort      `json:"ports,omitempty"`
	Labels  map[string]string `json:"labels,omitempty"`
}

// DockerPort Docker端口映射
type DockerPort struct {
	PrivatePort int    `json:"privatePort"`
	PublicPort  int    `json:"publicPort,omitempty"`
	Type        string `json:"type"` // tcp, udp
}
