package integration

// IntegrationKind 集成类型常量
type IntegrationKind string

const (
	KindJellyfin IntegrationKind = "jellyfin"
	KindPlex     IntegrationKind = "plex"
	KindEmby     IntegrationKind = "emby"
	KindTdarr    IntegrationKind = "tdarr"
	// 媒体管理集成
	KindSonarr   IntegrationKind = "sonarr"
	KindRadarr   IntegrationKind = "radarr"
	KindLidarr   IntegrationKind = "lidarr"
	KindProwlarr IntegrationKind = "prowlarr"
	// 媒体请求
	KindOverseerr IntegrationKind = "overseerr"
	// 下载客户端扩展
	KindDeluge  IntegrationKind = "deluge"
	KindSABnzbd IntegrationKind = "sabnzbd"
	// 云存储
	KindNextcloud IntegrationKind = "nextcloud"
	// 通知服务
	KindNTFY   IntegrationKind = "ntfy"
	KindGotify IntegrationKind = "gotify"
	// Docker管理
	KindPortainer IntegrationKind = "portainer"
	// 监控可视化
	KindGrafana IntegrationKind = "grafana"
	// 媒体请求扩展
	KindJellyseerr IntegrationKind = "jellyseerr"
	// 电子书管理
	KindReadarr IntegrationKind = "readarr"
	// Usenet下载
	KindNZBGet IntegrationKind = "nzbget"
	// Plex统计
	KindTautulli IntegrationKind = "tautulli"
	// NAS管理
	KindOpenMediaVault IntegrationKind = "openmediavault"
	KindQBittorrent    IntegrationKind = "qbittorrent"
	KindTransmission   IntegrationKind = "transmission"
	KindAria2          IntegrationKind = "aria2"
	KindPiHole         IntegrationKind = "pihole"
	KindAdGuardHome    IntegrationKind = "adguard"
	KindProxmox        IntegrationKind = "proxmox"
	KindTrueNAS        IntegrationKind = "truenas"
	KindUnraid         IntegrationKind = "unraid"
	KindDocker         IntegrationKind = "docker"
	KindSystemMonitor  IntegrationKind = "system-monitor"
	KindHomeAssistant  IntegrationKind = "home-assistant"
	KindGitHub         IntegrationKind = "github"
)

// StreamSession 流媒体播放会话
type StreamSession struct {
	SessionID  string `json:"sessionId"`
	Username   string `json:"username"`
	ItemName   string `json:"itemName"`
	ItemType   string `json:"itemType"`
	Progress   int    `json:"progress,omitempty"`   // 播放进度（秒）
	Duration   int    `json:"duration,omitempty"`   // 总时长（秒）
	Quality    string `json:"quality,omitempty"`    // 播放质量
	DeviceName string `json:"deviceName,omitempty"` // 设备名称
	IsPaused   bool   `json:"isPaused"`             // 是否暂停
}

// MediaItem 媒体项目
type MediaItem struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Type        string   `json:"type"` // movie, tv, music
	Year        int      `json:"year,omitempty"`
	Rating      float64  `json:"rating,omitempty"`
	Description string   `json:"description,omitempty"`
	PosterURL   string   `json:"posterUrl,omitempty"`
	BackdropURL string   `json:"backdropUrl,omitempty"`
	Genres      []string `json:"genres,omitempty"`
	AddedAt     string   `json:"addedAt,omitempty"`
}

// TorrentItem 下载项目
type TorrentItem struct {
	Hash          string  `json:"hash"`
	Name          string  `json:"name"`
	Size          int64   `json:"size"`
	Progress      float64 `json:"progress"`      // 0-100
	DownloadSpeed int64   `json:"downloadSpeed"` // bytes/s
	UploadSpeed   int64   `json:"uploadSpeed"`   // bytes/s
	ETA           int     `json:"eta"`           // 秒
	State         string  `json:"state"`         // downloading, seeding, paused等
	Ratio         float64 `json:"ratio"`
	AddedDate     string  `json:"addedDate"`
}

// ClientStatus 客户端状态
type ClientStatus struct {
	TotalDownloadSpeed int64 `json:"totalDownloadSpeed"` // bytes/s
	TotalUploadSpeed   int64 `json:"totalUploadSpeed"`   // bytes/s
	ActiveDownloads    int   `json:"activeDownloads"`
	TotalDownloads     int   `json:"totalDownloads"`
	FreeSpace          int64 `json:"freeSpace,omitempty"` // bytes
}

// SystemHealth 系统健康状态
type SystemHealth struct {
	CPUPercent    float64 `json:"cpuPercent"`
	MemoryPercent float64 `json:"memoryPercent"`
	MemoryUsed    int64   `json:"memoryUsed"`  // bytes
	MemoryTotal   int64   `json:"memoryTotal"` // bytes
	DiskPercent   float64 `json:"diskPercent"`
	DiskUsed      int64   `json:"diskUsed"`              // bytes
	DiskTotal     int64   `json:"diskTotal"`             // bytes
	Uptime        int64   `json:"uptime"`                // 秒
	Temperature   float64 `json:"temperature,omitempty"` // 摄氏度
}

// DNSStats DNS统计信息
type DNSStats struct {
	QueriesTotal   int     `json:"queriesTotal"`
	QueriesBlocked int     `json:"queriesBlocked"`
	BlockRate      float64 `json:"blockRate"` // 百分比
	ClientsActive  int     `json:"clientsActive"`
	DomainsBlocked int     `json:"domainsBlocked"`
}

// TestConnectionResult 连接测试结果
type TestConnectionResult struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Error   string `json:"error,omitempty"`
}

type TdarrQueue struct {
	Array      []TdarrQueueItem `json:"array"`
	TotalCount int              `json:"totalCount"`
	StartIndex int              `json:"startIndex"`
	EndIndex   int              `json:"endIndex"`
}

type TdarrQueueItem struct {
	ID          string `json:"id"`
	HealthCheck string `json:"healthCheck"`
	Transcode   string `json:"transcode"`
	FilePath    string `json:"filePath"`
	FileSize    int64  `json:"fileSize"`
	Container   string `json:"container"`
	Codec       string `json:"codec"`
	Resolution  string `json:"resolution"`
	Type        string `json:"type"`
}

type TdarrPieSegment struct {
	Name  string `json:"name"`
	Value int    `json:"value"`
}

type TdarrStatistics struct {
	LibraryName            string            `json:"libraryName"`
	TotalFileCount         int               `json:"totalFileCount"`
	TotalTranscodeCount    int               `json:"totalTranscodeCount"`
	TotalHealthCheckCount  int               `json:"totalHealthCheckCount"`
	FailedTranscodeCount   int               `json:"failedTranscodeCount"`
	FailedHealthCheckCount int               `json:"failedHealthCheckCount"`
	StagedTranscodeCount   int               `json:"stagedTranscodeCount"`
	StagedHealthCheckCount int               `json:"stagedHealthCheckCount"`
	TotalSavedSpace        int64             `json:"totalSavedSpace"`
	TranscodeStatus        []TdarrPieSegment `json:"transcodeStatus"`
	HealthCheckStatus      []TdarrPieSegment `json:"healthCheckStatus"`
	VideoCodecs            []TdarrPieSegment `json:"videoCodecs"`
	VideoContainers        []TdarrPieSegment `json:"videoContainers"`
	VideoResolutions       []TdarrPieSegment `json:"videoResolutions"`
	AudioCodecs            []TdarrPieSegment `json:"audioCodecs"`
	AudioContainers        []TdarrPieSegment `json:"audioContainers"`
}

type TdarrWorker struct {
	ID            string  `json:"id"`
	FilePath      string  `json:"filePath"`
	FPS           float64 `json:"fps"`
	Percentage    float64 `json:"percentage"`
	ETA           string  `json:"ETA"`
	JobType       string  `json:"jobType"`
	Status        string  `json:"status"`
	Step          string  `json:"step"`
	OriginalSize  int64   `json:"originalSize"`
	EstimatedSize *int64  `json:"estimatedSize,omitempty"`
	OutputSize    *int64  `json:"outputSize,omitempty"`
}
