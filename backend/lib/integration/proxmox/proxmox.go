package proxmox

import (
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// ProxmoxIntegration Proxmox 虚拟化集成
type ProxmoxIntegration struct {
	*integration.BaseIntegration
}

// New 创建 Proxmox 集成实例
func New(id, name, url string, secrets map[string]string) *ProxmoxIntegration {
	return &ProxmoxIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindProxmox), url, secrets),
	}
}

// TestConnection 测试 Proxmox 连接
func (p *ProxmoxIntegration) TestConnection(ctx context.Context) error {
	_, err := p.fetchNodes(ctx)
	if err != nil {
		return fmt.Errorf("proxmox 测试连接失败: %w", err)
	}
	return nil
}

// GetSystemHealth 通过 Proxmox 节点信息粗略推导系统健康状态
//
// 说明：
// - 为保持简单，我们只取第一个在线节点的数据；
// - CPU 使用率使用 Proxmox 返回的 cpu(0-1) * 100；
// - 内存、磁盘使用率按 used/total 计算；
// - 温度暂不从 Proxmox 获取，保持为 0。
func (p *ProxmoxIntegration) GetSystemHealth(ctx context.Context) (*integration.SystemHealth, error) {
	resp, err := p.fetchNodes(ctx)
	if err != nil {
		return nil, err
	}

	if len(resp.Data) == 0 {
		return nil, fmt.Errorf("proxmox 未返回任何节点数据")
	}

	// 选择第一个节点；后续可以扩展为按名称筛选
	node := resp.Data[0]

	cpuPercent := node.CPU * 100

	var memPercent float64
	if node.MaxMem > 0 {
		memPercent = float64(node.Mem) / float64(node.MaxMem) * 100
	}

	var diskPercent float64
	if node.MaxDisk > 0 {
		diskPercent = float64(node.Disk) / float64(node.MaxDisk) * 100
	}

	return &integration.SystemHealth{
		CPUPercent:    cpuPercent,
		MemoryPercent: memPercent,
		MemoryUsed:    node.Mem,
		MemoryTotal:   node.MaxMem,
		DiskPercent:   diskPercent,
		DiskUsed:      node.Disk,
		DiskTotal:     node.MaxDisk,
		Uptime:        node.Uptime,
		Temperature:   0,
	}, nil
}

// proxmoxNodesResponse 对应 /api2/json/nodes 响应
type proxmoxNodesResponse struct {
	Data []proxmoxNode `json:"data"`
}

type proxmoxNode struct {
	ID      string  `json:"id"`
	Node    string  `json:"node"`
	Status  string  `json:"status"`
	CPU     float64 `json:"cpu"`
	MaxCPU  int     `json:"maxcpu"`
	Mem     int64   `json:"mem"`
	MaxMem  int64   `json:"maxmem"`
	Disk    int64   `json:"disk"`
	MaxDisk int64   `json:"maxdisk"`
	Uptime  int64   `json:"uptime"`
}

// fetchNodes 拉取 Proxmox 节点列表
func (p *ProxmoxIntegration) fetchNodes(ctx context.Context) (*proxmoxNodesResponse, error) {
	authHeader, err := p.buildAuthHeader()
	if err != nil {
		return nil, err
	}

	url := p.BuildURL("/api2/json/nodes")
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", authHeader)

	resp, err := p.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取 Proxmox 节点失败: HTTP %d", resp.StatusCode)
	}

	var nodes proxmoxNodesResponse
	if err := json.NewDecoder(resp.Body).Decode(&nodes); err != nil {
		return nil, fmt.Errorf("解析 Proxmox 响应失败: %w", err)
	}

	return &nodes, nil
}

// buildAuthHeader 构建 Proxmox API Token 认证头
//
// 支持两种配置方式：
// 1) 直接提供 tokenId（完整的 user@realm!tokenId）
// 2) 拆分配置 username / realm / tokenId，由本方法拼接
func (p *ProxmoxIntegration) buildAuthHeader() (string, error) {
	apiKey := p.GetSecret("apiKey")
	if apiKey == "" {
		apiKey = p.GetSecret("token")
	}

	if apiKey == "" {
		return "", fmt.Errorf("proxmox 未配置 apiKey/token")
	}

	tokenID := p.GetSecret("tokenId")
	if tokenID == "" {
		// 尝试从 username/realm 拼接
		username := p.GetSecret("username")
		realm := p.GetSecret("realm")
		raw := p.GetSecret("tokenID")
		if raw != "" {
			tokenID = raw
		} else if username != "" && realm != "" {
			tokenID = fmt.Sprintf("%s@%s!%s", username, realm, p.GetSecret("tokenName"))
		}
	}

	if tokenID == "" {
		return "", fmt.Errorf("proxmox 未配置 tokenId 或 username/realm")
	}

	return fmt.Sprintf("PVEAPIToken=%s=%s", tokenID, apiKey), nil
}
