package monitor

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"time"

	stdnet "net"

	"github.com/mindprince/gonvml"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
	gopsnet "github.com/shirou/gopsutil/v3/net"
	"github.com/yusufpapurcu/wmi"
)

var (
	winTempNamespaceCache string
	winTempCacheLock      sync.RWMutex
)

type CPUInfo struct {
	CoreCount   int32     `json:"coreCount"`
	CPUNum      int       `json:"cpuNum"`
	Model       string    `json:"model"`
	Usages      []float64 `json:"usages"`
	Temperature float64   `json:"temperature"`
}

type DiskInfo struct {
	Mountpoint  string  `json:"mountpoint"`
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	UsedPercent float64 `json:"usedPercent"`
}

type NetIOCountersInfo struct {
	BytesSent uint64 `json:"bytesSent"`
	BytesRecv uint64 `json:"bytesRecv"`
	Name      string `json:"name"`
}

type MemoryInfo struct {
	Total       uint64  `json:"total"`
	Free        uint64  `json:"free"`
	Used        uint64  `json:"used"`
	UsedPercent float64 `json:"usedPercent"`
}

type GPUInfo struct {
	Name        string  `json:"name"`
	Temperature float64 `json:"temperature"`
	Utilization float64 `json:"utilization"`
	Power       float64 `json:"power"`
}

type PowerInfo struct {
	Total float64 `json:"total"`
}

type DockerContainerInfo struct {
	ID         string            `json:"id"`
	Name       string            `json:"name"`
	Image      string            `json:"image"`
	State      string            `json:"state"`
	Status     string            `json:"status"`
	Created    int64             `json:"created"`
	Labels     map[string]string `json:"labels"`
	CPUPercent float64           `json:"cpuPercent"`
	MemUsage   uint64            `json:"memUsage"`
	MemLimit   uint64            `json:"memLimit"`
	MemPercent float64           `json:"memPercent"`
}

type ContainerDetectInfo struct {
	InContainer            bool     `json:"inContainer"`
	Hostname               string   `json:"hostname"`
	Indicators             []string `json:"indicators"`
	DockerSocketCandidates []string `json:"dockerSocketCandidates"`
}

func GetCPUInfo() (CPUInfo, error) {
	cpuInfoRes := CPUInfo{}
	cpuInfo, err := cpu.Info()

	if err == nil && len(cpuInfo) > 0 {
		cpuInfoRes.CoreCount = cpuInfo[0].Cores
		cpuInfoRes.Model = cpuInfo[0].ModelName
	}
	numCPU, _ := cpu.Counts(true)
	cpuInfoRes.CPUNum = numCPU

	// Use 0 duration to get percentage since last call (avoid blocking)
	// Background poller will get the delta since the previous 5s poll
	cpuPercentages, err := cpu.Percent(0, true)
	cpuInfoRes.Usages = cpuPercentages

	if temps, terr := host.SensorsTemperatures(); terr == nil {
		if v := pickCPUCoreTemperatureFromSensors(temps); v > 0 {
			cpuInfoRes.Temperature = v
		} else if v := pickCPUTemperatureFromSensors(temps); v > 0 {
			cpuInfoRes.Temperature = v
		}
	}

	if cpuInfoRes.Temperature == 0 {
		if t, terr := getCPUTemperatureFallback(); terr == nil && t > 0 {
			cpuInfoRes.Temperature = t
		}
	}

	return cpuInfoRes, err
}

// 获取内存信息 单位：MB
func GetMemoryInfo() (MemoryInfo, error) {
	memoryInfo := MemoryInfo{}
	// 获取内存信息
	memInfo, err := mem.VirtualMemory()
	if err == nil {
		memoryInfo.Free = memInfo.Free
		memoryInfo.Total = memInfo.Total
		memoryInfo.Used = memInfo.Used
		memoryInfo.UsedPercent = memInfo.UsedPercent
	}

	return memoryInfo, err
}

// 获取每个磁盘分区使用情况
func GetDiskInfo() ([]DiskInfo, error) {
	disks := []DiskInfo{}
	// 获取所有磁盘分区的信息
	partitions, err := disk.Partitions(true)
	if err != nil {
		return disks, err
	}

	for _, partition := range partitions {
		usage, err := disk.Usage(partition.Mountpoint)
		if err != nil {
			// fmt.Printf("Error getting disk usage for %s: %v\n", partition.Mountpoint, err)
			continue
		}

		disks = append(disks, DiskInfo{
			Mountpoint:  partition.Mountpoint,
			Total:       usage.Total / 1024 / 1024,
			Used:        usage.Used / 1024 / 1024,
			Free:        usage.Free / 1024 / 1024,
			UsedPercent: usage.UsedPercent,
		})
	}

	return disks, nil
}

func GetDiskMountpoints() ([]disk.PartitionStat, error) {
	return disk.Partitions(true)
}

func GetDiskInfoByPath(path string) (*DiskInfo, error) {
	diskInfo := DiskInfo{}
	usage, err := disk.Usage(path)
	if err != nil {
		return nil, err
	}
	diskInfo.Free = usage.Free
	diskInfo.Mountpoint = usage.Path
	diskInfo.Total = usage.Total
	diskInfo.Used = usage.Used
	diskInfo.UsedPercent = usage.UsedPercent
	return &diskInfo, nil
}

// 获取网络统计信息
func GetNetIOCountersInfo() ([]NetIOCountersInfo, error) {
	netInfo := []NetIOCountersInfo{}
	netStats, err := gopsnet.IOCounters(true)
	if err == nil {
		for _, netStat := range netStats {
			netInfo = append(netInfo, NetIOCountersInfo{
				BytesRecv: netStat.BytesRecv,
				BytesSent: netStat.BytesSent,
				Name:      netStat.Name,
			})

		}
	}
	return netInfo, err
}

var (
	nvmlOnce   sync.Once
	nvmlInited bool
)

func GetGPUInfo() ([]GPUInfo, error) {
	result := []GPUInfo{}

	nvmlOnce.Do(func() {
		if err := gonvml.Initialize(); err == nil {
			nvmlInited = true
		}
	})

	if !nvmlInited {
		if alt, altErr := getGPUInfoViaNvidiaSmi(); altErr == nil {
			return alt, nil
		}
		return result, nil
	}

	count, err := gonvml.DeviceCount()
	if err != nil {
		return result, nil
	}

	for i := uint(0); i < count; i++ {
		device, err := gonvml.DeviceHandleByIndex(i)
		if err != nil {
			continue
		}

		name, _ := device.Name()
		temp, _ := device.Temperature()
		util, _, _ := device.UtilizationRates()
		powerMilliwatts, _ := device.PowerUsage()

		info := GPUInfo{
			Name:        name,
			Temperature: float64(temp),
			Utilization: float64(util),
			Power:       float64(powerMilliwatts) / 1000.0,
		}
		result = append(result, info)
	}

	return result, nil
}

func getGPUInfoViaNvidiaSmi() ([]GPUInfo, error) {
	result := []GPUInfo{}

	cmd := exec.Command("nvidia-smi", "--query-gpu=name,temperature.gpu,utilization.gpu,power.draw", "--format=csv,noheader,nounits")
	out, err := cmd.Output()
	if err != nil {
		return result, err
	}

	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		parts := strings.Split(line, ",")
		if len(parts) < 4 {
			continue
		}

		name := strings.TrimSpace(parts[0])

		temp, err1 := strconv.ParseFloat(strings.TrimSpace(parts[1]), 64)
		util, err2 := strconv.ParseFloat(strings.TrimSpace(parts[2]), 64)
		power, err3 := strconv.ParseFloat(strings.TrimSpace(parts[3]), 64)
		if err1 != nil || err2 != nil || err3 != nil {
			continue
		}

		result = append(result, GPUInfo{
			Name:        name,
			Temperature: temp,
			Utilization: util,
			Power:       power,
		})
	}

	return result, nil
}

func GetPowerInfo() (PowerInfo, error) {
	powerInfo := PowerInfo{}
	gpuInfos, err := GetGPUInfo()
	if err != nil {
		return powerInfo, nil
	}

	var total float64
	for _, g := range gpuInfos {
		total += g.Power
	}

	powerInfo.Total = total
	return powerInfo, nil
}

func GetDockerContainers() ([]DockerContainerInfo, error) {
	socketPath, err := getDockerSocketPath()
	if err != nil {
		return []DockerContainerInfo{}, err
	}

	client := newDockerHTTPClient(socketPath)
	list, err := getDockerContainersBasic(client)
	if err != nil {
		return []DockerContainerInfo{}, err
	}
	if len(list) == 0 {
		return list, nil
	}

	sem := make(chan struct{}, 4)
	var wg sync.WaitGroup
	for i := range list {
		if strings.TrimSpace(list[i].ID) == "" {
			continue
		}
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()
			cpuPercent, memUsage, memLimit, memPercent, err := getDockerContainerStats(client, list[idx].ID)
			if err != nil {
				return
			}
			list[idx].CPUPercent = cpuPercent
			list[idx].MemUsage = memUsage
			list[idx].MemLimit = memLimit
			list[idx].MemPercent = memPercent
		}(i)
	}
	wg.Wait()

	return list, nil
}

func getDockerSocketPath() (string, error) {
	if runtime.GOOS != "linux" {
		return "", exec.ErrNotFound
	}

	socketPath := strings.TrimSpace(os.Getenv("DOCKER_SOCK"))
	if socketPath == "" {
		host := strings.TrimSpace(os.Getenv("DOCKER_HOST"))
		if strings.HasPrefix(host, "unix://") {
			socketPath = strings.TrimPrefix(host, "unix://")
		}
	}
	if socketPath == "" {
		socketPath = "/var/run/docker.sock"
	}

	if _, err := os.Stat(socketPath); err != nil {
		return "", err
	}
	return socketPath, nil
}

func newDockerHTTPClient(socketPath string) *http.Client {
	tr := &http.Transport{
		DialContext: func(ctx context.Context, network, addr string) (stdnet.Conn, error) {
			var d stdnet.Dialer
			return d.DialContext(ctx, "unix", socketPath)
		},
	}
	return &http.Client{
		Timeout:   4 * time.Second,
		Transport: tr,
	}
}

func getDockerContainersBasic(client *http.Client) ([]DockerContainerInfo, error) {
	req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, "http://docker/containers/json?all=1", nil)
	if err != nil {
		return []DockerContainerInfo{}, err
	}
	resp, err := client.Do(req)
	if err != nil {
		return []DockerContainerInfo{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return []DockerContainerInfo{}, fmt.Errorf("docker api status %d", resp.StatusCode)
	}

	type dockerAPIContainer struct {
		ID      string            `json:"Id"`
		Names   []string          `json:"Names"`
		Image   string            `json:"Image"`
		State   string            `json:"State"`
		Status  string            `json:"Status"`
		Created int64             `json:"Created"`
		Labels  map[string]string `json:"Labels"`
	}
	var items []dockerAPIContainer
	if err := json.NewDecoder(resp.Body).Decode(&items); err != nil {
		return []DockerContainerInfo{}, err
	}

	result := make([]DockerContainerInfo, 0, len(items))
	for _, it := range items {
		name := ""
		if len(it.Names) > 0 {
			name = strings.TrimPrefix(strings.TrimSpace(it.Names[0]), "/")
		}
		result = append(result, DockerContainerInfo{
			ID:      it.ID,
			Name:    name,
			Image:   it.Image,
			State:   it.State,
			Status:  it.Status,
			Created: it.Created,
			Labels:  it.Labels,
		})
	}
	return result, nil
}

func getDockerContainerStats(client *http.Client, id string) (float64, uint64, uint64, float64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "http://docker/containers/"+id+"/stats?stream=false", nil)
	if err != nil {
		return 0, 0, 0, 0, err
	}
	resp, err := client.Do(req)
	if err != nil {
		return 0, 0, 0, 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return 0, 0, 0, 0, fmt.Errorf("docker api status %d", resp.StatusCode)
	}

	type dockerCPUUsage struct {
		TotalUsage  uint64   `json:"total_usage"`
		PercpuUsage []uint64 `json:"percpu_usage"`
	}
	type dockerCPUStats struct {
		CPUUsage       dockerCPUUsage `json:"cpu_usage"`
		SystemCPUUsage uint64         `json:"system_cpu_usage"`
		OnlineCPUs     uint32         `json:"online_cpus"`
	}
	type dockerMemoryStats struct {
		Usage uint64            `json:"usage"`
		Limit uint64            `json:"limit"`
		Stats map[string]uint64 `json:"stats"`
	}
	type dockerStatsResp struct {
		CPUStats    dockerCPUStats    `json:"cpu_stats"`
		PreCPUStats dockerCPUStats    `json:"precpu_stats"`
		MemoryStats dockerMemoryStats `json:"memory_stats"`
	}

	var s dockerStatsResp
	if err := json.NewDecoder(resp.Body).Decode(&s); err != nil {
		return 0, 0, 0, 0, err
	}

	cpuDelta := float64(s.CPUStats.CPUUsage.TotalUsage - s.PreCPUStats.CPUUsage.TotalUsage)
	systemDelta := float64(s.CPUStats.SystemCPUUsage - s.PreCPUStats.SystemCPUUsage)
	onlineCPUs := float64(s.CPUStats.OnlineCPUs)
	if onlineCPUs == 0 {
		if n := len(s.CPUStats.CPUUsage.PercpuUsage); n > 0 {
			onlineCPUs = float64(n)
		}
	}
	cpuPercent := 0.0
	if systemDelta > 0 && cpuDelta > 0 && onlineCPUs > 0 {
		cpuPercent = (cpuDelta / systemDelta) * onlineCPUs * 100.0
	}

	memUsage := s.MemoryStats.Usage
	if s.MemoryStats.Stats != nil {
		if cache, ok := s.MemoryStats.Stats["cache"]; ok && memUsage > cache {
			memUsage -= cache
		}
	}
	memLimit := s.MemoryStats.Limit
	memPercent := 0.0
	if memLimit > 0 && memUsage > 0 {
		memPercent = float64(memUsage) * 100.0 / float64(memLimit)
	}

	return cpuPercent, memUsage, memLimit, memPercent, nil
}

func resolveDockerContainerID(container string) (string, error) {
	ref := strings.TrimSpace(container)
	if ref == "" {
		return "", fmt.Errorf("container required")
	}

	socketPath, err := getDockerSocketPath()
	if err != nil {
		return "", err
	}
	client := newDockerHTTPClient(socketPath)
	list, err := getDockerContainersBasic(client)
	if err != nil {
		return "", err
	}

	for _, it := range list {
		if it.ID == ref || strings.HasPrefix(it.ID, ref) {
			return it.ID, nil
		}
	}
	for _, it := range list {
		if it.Name == ref {
			return it.ID, nil
		}
	}

	return "", fmt.Errorf("container not found")
}

func dockerPostNoBody(path string, okStatuses map[int]bool) error {
	socketPath, err := getDockerSocketPath()
	if err != nil {
		return err
	}
	client := newDockerHTTPClient(socketPath)

	req, err := http.NewRequestWithContext(context.Background(), http.MethodPost, "http://docker"+path, nil)
	if err != nil {
		return err
	}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if okStatuses[resp.StatusCode] || (resp.StatusCode >= 200 && resp.StatusCode < 300) {
		return nil
	}
	b, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
	msg := strings.TrimSpace(string(b))
	if msg == "" {
		return fmt.Errorf("docker api status %d", resp.StatusCode)
	}
	return fmt.Errorf("docker api status %d: %s", resp.StatusCode, msg)
}

func DockerStartContainer(container string) error {
	id, err := resolveDockerContainerID(container)
	if err != nil {
		return err
	}
	return dockerPostNoBody("/containers/"+id+"/start", map[int]bool{204: true, 304: true})
}

func DockerStopContainer(container string) error {
	id, err := resolveDockerContainerID(container)
	if err != nil {
		return err
	}
	return dockerPostNoBody("/containers/"+id+"/stop?t=10", map[int]bool{204: true, 304: true})
}

func DockerRestartContainer(container string) error {
	id, err := resolveDockerContainerID(container)
	if err != nil {
		return err
	}
	return dockerPostNoBody("/containers/"+id+"/restart?t=10", map[int]bool{204: true})
}

func getCPUTemperatureFallback() (float64, error) {
	if runtime.GOOS != "windows" {
		return 0, exec.ErrNotFound
	}

	winTempCacheLock.RLock()
	cachedNs := winTempNamespaceCache
	winTempCacheLock.RUnlock()

	if cachedNs != "" {
		if v, err := getWindowsCPUTempCoreFromHardwareMonitorNamespace(cachedNs); err == nil && v > 0 {
			return v, nil
		}
		if v, err := getWindowsCPUTempFromHardwareMonitorNamespace(cachedNs); err == nil && v > 0 {
			return v, nil
		}
	}

	// Probe and cache
	namespaces := []string{"root\\LibreHardwareMonitor", "root\\OpenHardwareMonitor"}
	for _, ns := range namespaces {
		if v, err := getWindowsCPUTempCoreFromHardwareMonitorNamespace(ns); err == nil && v > 0 {
			winTempCacheLock.Lock()
			winTempNamespaceCache = ns
			winTempCacheLock.Unlock()
			return v, nil
		}
		if v, err := getWindowsCPUTempFromHardwareMonitorNamespace(ns); err == nil && v > 0 {
			winTempCacheLock.Lock()
			winTempNamespaceCache = ns
			winTempCacheLock.Unlock()
			return v, nil
		}
	}

	if v, err := getWindowsCPUTempFromAcpiThermalZones(); err == nil && v > 0 {
		return v, nil
	}
	if v, err := getWindowsCPUTempFromWin32TemperatureProbe(); err == nil && v > 0 {
		return v, nil
	}
	return 0, exec.ErrNotFound
}

func pickCPUCoreTemperatureFromSensors(temps []host.TemperatureStat) float64 {
	var best float64
	for _, t := range temps {
		if t.Temperature <= 0 || t.Temperature > 125 {
			continue
		}
		key := strings.ToLower(strings.TrimSpace(t.SensorKey))
		if key == "" {
			continue
		}
		if strings.Contains(key, "core") && !strings.Contains(key, "package") {
			if t.Temperature > best {
				best = t.Temperature
			}
		}
	}
	if best > 0 && !math.IsNaN(best) && !math.IsInf(best, 0) {
		return best
	}
	return 0
}

func pickCPUTemperatureFromSensors(temps []host.TemperatureStat) float64 {
	var sum float64
	var count float64
	for _, t := range temps {
		if t.Temperature <= 0 || t.Temperature > 125 {
			continue
		}
		key := strings.ToLower(strings.TrimSpace(t.SensorKey))
		if key == "" {
			continue
		}
		if strings.Contains(key, "cpu") || strings.Contains(key, "k10temp") || strings.Contains(key, "coretemp") {
			sum += t.Temperature
			count++
		}
	}
	if count > 0 {
		v := sum / count
		if v > 0 && !math.IsNaN(v) && !math.IsInf(v, 0) {
			return v
		}
	}
	return 0
}

type hardwareSensor struct {
	Name       string
	Value      float64
	SensorType string
}

func getWindowsCPUTempCoreFromHardwareMonitorNamespace(ns string) (float64, error) {
	var dst []hardwareSensor
	query := `SELECT Name, Value, SensorType FROM Sensor WHERE SensorType = 'Temperature' AND (Name LIKE '%Core%' OR Name LIKE '%CCD%')`
	err := wmi.QueryNamespace(query, &dst, ns)
	if err != nil {
		return 0, err
	}

	var best float64
	for _, s := range dst {
		if s.Value > 0 && s.Value < 125 {
			if s.Value > best {
				best = s.Value
			}
		}
	}

	if best > 0 {
		return best, nil
	}
	return 0, exec.ErrNotFound
}

func getWindowsCPUTempFromHardwareMonitorNamespace(ns string) (float64, error) {
	var dst []hardwareSensor
	query := `SELECT Name, Value, SensorType FROM Sensor WHERE SensorType = 'Temperature' AND (Name LIKE '%CPU%' OR Name LIKE '%Package%' OR Name LIKE '%Tctl%' OR Name LIKE '%Tdie%')`
	err := wmi.QueryNamespace(query, &dst, ns)
	if err != nil {
		return 0, err
	}

	var best float64
	for _, s := range dst {
		if s.Value > 0 && s.Value < 125 {
			if s.Value > best {
				best = s.Value
			}
		}
	}

	if best > 0 {
		return best, nil
	}
	return 0, exec.ErrNotFound
}

func getWindowsCPUTempFromAcpiThermalZones() (float64, error) {
	type MSAcpi_ThermalZoneTemperature struct {
		CurrentTemperature uint32
	}
	var dst []MSAcpi_ThermalZoneTemperature
	err := wmi.QueryNamespace("SELECT CurrentTemperature FROM MSAcpi_ThermalZoneTemperature", &dst, "root\\wmi")
	if err != nil {
		return 0, err
	}

	var best float64
	for _, tz := range dst {
		c := float64(tz.CurrentTemperature)/10 - 273.15
		if c < 1 || c > 125 {
			continue
		}
		if c > best {
			best = c
		}
	}

	if best > 0 && !math.IsNaN(best) && !math.IsInf(best, 0) {
		return best, nil
	}
	return 0, exec.ErrNotFound
}

func getWindowsCPUTempFromWin32TemperatureProbe() (float64, error) {
	type Win32_TemperatureProbe struct {
		CurrentReading uint32
	}
	var dst []Win32_TemperatureProbe
	err := wmi.QueryNamespace("SELECT CurrentReading FROM Win32_TemperatureProbe", &dst, "root\\cimv2")
	if err != nil {
		return 0, err
	}

	var best float64
	for _, tp := range dst {
		c := float64(tp.CurrentReading)/10 - 273.15
		if c < 1 || c > 125 {
			continue
		}
		if c > best {
			best = c
		}
	}

	if best > 0 && !math.IsNaN(best) && !math.IsInf(best, 0) {
		return best, nil
	}
	return 0, exec.ErrNotFound
}

// func GetCountDiskInfo() {
// 	// 获取所有磁盘的总使用情况
// 	allUsage, err := disk.Usage("/")
// 	if err != nil {
// 		fmt.Printf("Error getting total disk usage: %v\n", err)
// 		return
// 	}

//		// 打印所有磁盘的总使用情况
//		fmt.Println("Total Disk Usage:")
//		fmt.Printf("Total: %d MB\n", allUsage.Total/1024/1024)
//		fmt.Printf("Used: %d MB\n", allUsage.Used/1024/1024)
//		fmt.Printf("Free: %d MB\n", allUsage.Free/1024/1024)
//		fmt.Printf("Usage: %.2f%%\n", allUsage.UsedPercent)
//	}
func GetContainerDetectInfo() ContainerDetectInfo {
	info := ContainerDetectInfo{
		DockerSocketCandidates: []string{
			"/var/run/docker.sock",
			"/run/docker.sock",
		},
	}

	hostname, _ := os.Hostname()
	info.Hostname = hostname

	// Detect container
	if _, err := os.Stat("/.dockerenv"); err == nil {
		info.InContainer = true
		info.Indicators = append(info.Indicators, "/.dockerenv")
	}

	if data, err := os.ReadFile("/proc/self/cgroup"); err == nil {
		if strings.Contains(string(data), "docker") || strings.Contains(string(data), "containerd") {
			info.InContainer = true
			info.Indicators = append(info.Indicators, "/proc/self/cgroup")
		}
	}

	return info
}

func GetMemoryInfoFromPrometheus() (MemoryInfo, bool, error) {
	promURL := os.Getenv("MONITOR_PROMETHEUS_URL")
	if promURL == "" {
		promURL = os.Getenv("PROMETHEUS_URL")
	}

	if promURL == "" {
		return MemoryInfo{}, false, nil
	}

	query := func(q string) (uint64, error) {
		url := fmt.Sprintf("%s/api/v1/query?query=%s", strings.TrimSuffix(promURL, "/"), q)
		resp, err := http.Get(url)
		if err != nil {
			return 0, err
		}
		defer resp.Body.Close()

		var r struct {
			Status string `json:"status"`
			Data   struct {
				Result []struct {
					Value []interface{} `json:"value"`
				} `json:"result"`
			} `json:"data"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&r); err != nil {
			return 0, err
		}
		if r.Status != "success" || len(r.Data.Result) == 0 || len(r.Data.Result[0].Value) < 2 {
			return 0, fmt.Errorf("no data")
		}
		vStr, ok := r.Data.Result[0].Value[1].(string)
		if !ok {
			return 0, fmt.Errorf("invalid data format")
		}
		val, err := strconv.ParseUint(vStr, 10, 64)
		return val, err
	}

	total, err := query("node_memory_MemTotal_bytes")
	if err != nil {
		return MemoryInfo{}, true, err
	}
	avail, err := query("node_memory_MemAvailable_bytes")
	if err != nil {
		return MemoryInfo{}, true, err
	}

	used := total - avail
	return MemoryInfo{
		Total:       total,
		Free:        avail,
		Used:        used,
		UsedPercent: float64(used) * 100 / float64(total),
	}, true, nil
}
