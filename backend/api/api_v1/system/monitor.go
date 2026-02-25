package system

import (
	"encoding/json"
	"fmt"
	"matrix-panel/api/api_v1/common/apiData/systemApiStructs"
	"matrix-panel/api/api_v1/common/apiReturn"
	"matrix-panel/global"
	"matrix-panel/lib/monitor"
	"matrix-panel/lib/siteFavicon"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
)

type MonitorApi struct{}

const cacheSecond = 5

// 弃用
func (a *MonitorApi) GetAll(c *gin.Context) {
	if value, ok := global.SystemMonitor.Get("value"); ok {
		apiReturn.SuccessData(c, value)
		return
	}
	apiReturn.Error(c, "failed")
}

func (a *MonitorApi) GetCpuState(c *gin.Context) {
	// Try hot cache first
	if val, ok := global.SystemMonitor.Get("value"); ok {
		if m, mOk := val.(global.ModelSystemMonitor); mOk {
			apiReturn.SuccessData(c, m.CPUInfo)
			return
		}
	}

	// Fallback to individual cache
	if v, ok := global.SystemMonitor.Get(global.SystemMonitor_CPU_INFO); ok {
		apiReturn.SuccessData(c, v)
		return
	}

	cpuInfo, err := monitor.GetCPUInfo()
	if err != nil {
		apiReturn.Error(c, "failed")
		return
	}
	global.SystemMonitor.Set(global.SystemMonitor_CPU_INFO, cpuInfo, cacheSecond*time.Second)
	apiReturn.SuccessData(c, cpuInfo)
}

func (a *MonitorApi) GetMemonyState(c *gin.Context) {
	// Try hot cache first
	if val, ok := global.SystemMonitor.Get("value"); ok {
		if m, mOk := val.(global.ModelSystemMonitor); mOk {
			apiReturn.SuccessData(c, m.MemoryInfo)
			return
		}
	}

	if v, ok := global.SystemMonitor.Get(global.SystemMonitor_MEMORY_INFO); ok {
		apiReturn.SuccessData(c, v)
		return
	}
	memoryInfo, err := monitor.GetMemoryInfo()
	if err != nil {
		apiReturn.Error(c, "failed")
		return
	}
	global.SystemMonitor.Set(global.SystemMonitor_MEMORY_INFO, memoryInfo, cacheSecond*time.Second)
	apiReturn.SuccessData(c, memoryInfo)
}

func (a *MonitorApi) GetDiskStateByPath(c *gin.Context) {

	req := systemApiStructs.MonitorGetDiskStateByPathReq{}
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		apiReturn.ErrorParamFomat(c, err.Error())
		return
	}

	cacheDiskName := global.SystemMonitor_DISK_INFO + req.Path

	if v, ok := global.SystemMonitor.Get(cacheDiskName); ok {
		global.Logger.Debugln("读取缓存的的DISK信息")
		apiReturn.SuccessData(c, v)
		return
	}

	diskState, err := monitor.GetDiskInfoByPath(req.Path)
	if err != nil {
		apiReturn.Error(c, "failed")
		return
	}

	// 缓存
	global.SystemMonitor.Set(cacheDiskName, diskState, cacheSecond*time.Second)
	apiReturn.SuccessData(c, diskState)
}

func (a *MonitorApi) GetDiskMountpoints(c *gin.Context) {
	if list, err := monitor.GetDiskMountpoints(); err != nil {
		apiReturn.Error(c, err.Error())
		return
	} else {
		apiReturn.SuccessData(c, list)
	}
}

func (a *MonitorApi) GetDiskStateAll(c *gin.Context) {
	// Try hot cache first
	if val, ok := global.SystemMonitor.Get("value"); ok {
		if m, mOk := val.(global.ModelSystemMonitor); mOk {
			apiReturn.SuccessData(c, m.DiskInfo)
			return
		}
	}

	cacheKey := global.SystemMonitor_DISK_INFO + "_ALL"
	if v, ok := global.SystemMonitor.Get(cacheKey); ok {
		apiReturn.SuccessData(c, v)
		return
	}

	// This is a heavy operation, ideally backgrounded
	partitions, err := monitor.GetDiskMountpoints()
	if err != nil {
		apiReturn.Error(c, "failed")
		return
	}
	// ... (Agg logic kept for fallback, but simplified for brevity in this view)
	// Actually I will keep it as is for reliability if hot cache fails
	agg := map[string]*monitor.DiskInfo{}
	for _, p := range partitions {
		mp := p.Mountpoint
		if mp == "" {
			continue
		}
		key := physicalDiskKey(p.Device, mp)
		if key == "" {
			key = mp
		}
		info, err := monitor.GetDiskInfoByPath(mp)
		if err != nil || info == nil {
			continue
		}
		if _, ok := agg[key]; !ok {
			agg[key] = &monitor.DiskInfo{Mountpoint: key}
		}
		d := agg[key]
		d.Total += info.Total
		d.Used += info.Used
		d.Free += info.Free
	}
	list := make([]monitor.DiskInfo, 0, len(agg))
	for _, d := range agg {
		if d.Total > 0 {
			d.UsedPercent = float64(d.Used) * 100 / float64(d.Total)
		}
		list = append(list, *d)
	}
	sort.SliceStable(list, func(i, j int) bool { return list[i].Mountpoint < list[j].Mountpoint })

	global.SystemMonitor.Set(cacheKey, list, cacheSecond*time.Second)
	apiReturn.SuccessData(c, list)
}

func physicalDiskKey(device string, mountpoint string) string {
	dev := strings.TrimSpace(device)
	if dev == "overlay" || dev == "tmpfs" {
		return ""
	}
	if dev == "" {
		dev = strings.TrimSpace(mountpoint)
	}

	if strings.HasPrefix(dev, "/dev/nvme") {
		if idx := strings.LastIndex(dev, "p"); idx > 0 {
			return dev[:idx]
		}
	}

	if strings.HasPrefix(dev, "/dev/") {
		i := len(dev) - 1
		for i >= 0 && dev[i] >= '0' && dev[i] <= '9' {
			i--
		}
		return dev[:i+1]
	}

	return dev
}

func (a *MonitorApi) GetNetIOState(c *gin.Context) {
	// Try hot cache first
	if val, ok := global.SystemMonitor.Get("value"); ok {
		if m, mOk := val.(global.ModelSystemMonitor); mOk {
			apiReturn.SuccessData(c, m.NetIOCountersInfo)
			return
		}
	}

	if netInfo, err := monitor.GetNetIOCountersInfo(); err != nil {
		apiReturn.Error(c, "failed")
		return
	} else {
		apiReturn.SuccessData(c, netInfo)
	}
}

type fetchFaviconReq struct {
	Url string `json:"url"`
}

func (a *MonitorApi) FetchFavicon(c *gin.Context) {
	req := fetchFaviconReq{}
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		apiReturn.ErrorParamFomat(c, err.Error())
		return
	}

	target := strings.TrimSpace(req.Url)
	if target == "" {
		apiReturn.ErrorParamFomat(c, "url required")
		return
	}

	normalized, err := siteFavicon.NormalizeAndValidatePublicHTTPURL(target)
	if err != nil {
		apiReturn.ErrorParamFomat(c, "invalid url")
		return
	}

	if icon, err := siteFavicon.GetOneFaviconURL(normalized); err == nil && icon != "" {
		apiReturn.SuccessData(c, icon)
		return
	}

	u, err := url.Parse(normalized)
	if err != nil || u.Host == "" {
		apiReturn.Error(c, "failed")
		return
	}

	scheme := u.Scheme
	if scheme == "" {
		scheme = "https"
	}

	apiReturn.SuccessData(c, scheme+"://"+u.Host+"/favicon.ico")
}

func (a *MonitorApi) GetGpuState(c *gin.Context) {
	// Try hot cache first
	if val, ok := global.SystemMonitor.Get("value"); ok {
		if m, mOk := val.(global.ModelSystemMonitor); mOk {
			apiReturn.SuccessData(c, m.GPUInfo)
			return
		}
	}

	if v, ok := global.SystemMonitor.Get(global.SystemMonitor_GPU_INFO); ok {
		apiReturn.SuccessData(c, v)
		return
	}

	if gpuInfo, err := monitor.GetGPUInfo(); err != nil {
		apiReturn.Error(c, "failed")
		return
	} else {
		global.SystemMonitor.Set(global.SystemMonitor_GPU_INFO, gpuInfo, cacheSecond*time.Second)
		apiReturn.SuccessData(c, gpuInfo)
	}
}

func (a *MonitorApi) GetPowerState(c *gin.Context) {
	// Try hot cache first
	if val, ok := global.SystemMonitor.Get("value"); ok {
		if m, mOk := val.(global.ModelSystemMonitor); mOk {
			apiReturn.SuccessData(c, m.PowerInfo)
			return
		}
	}

	if v, ok := global.SystemMonitor.Get(global.SystemMonitor_POWER_INFO); ok {
		apiReturn.SuccessData(c, v)
		return
	}

	if powerInfo, err := monitor.GetPowerInfo(); err != nil {
		apiReturn.Error(c, "failed")
		return
	} else {
		global.SystemMonitor.Set(global.SystemMonitor_POWER_INFO, powerInfo, cacheSecond*time.Second)
		apiReturn.SuccessData(c, powerInfo)
	}
}

func (a *MonitorApi) GetDockerState(c *gin.Context) {
	// Try hot cache first
	if val, ok := global.SystemMonitor.Get("value"); ok {
		if m, mOk := val.(global.ModelSystemMonitor); mOk {
			apiReturn.SuccessData(c, m.DockerInfo)
			return
		}
	}

	if v, ok := global.SystemMonitor.Get(global.SystemMonitor_DOCKER_INFO); ok {
		apiReturn.SuccessData(c, v)
		return
	}

	list, err := monitor.GetDockerContainers()
	if err != nil {
		apiReturn.Error(c, err.Error())
		return
	}
	global.SystemMonitor.Set(global.SystemMonitor_DOCKER_INFO, list, cacheSecond*time.Second)
	apiReturn.SuccessData(c, list)
}

type dockerActionReq struct {
	Container string `json:"container"`
}

func (a *MonitorApi) DockerStart(c *gin.Context) {
	req := dockerActionReq{}
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		apiReturn.ErrorParamFomat(c, err.Error())
		return
	}
	if err := monitor.DockerStartContainer(req.Container); err != nil {
		apiReturn.Error(c, err.Error())
		return
	}
	global.SystemMonitor.Delete(global.SystemMonitor_DOCKER_INFO)
	apiReturn.SuccessData(c, "ok")
}

func (a *MonitorApi) DockerStop(c *gin.Context) {
	req := dockerActionReq{}
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		apiReturn.ErrorParamFomat(c, err.Error())
		return
	}
	if err := monitor.DockerStopContainer(req.Container); err != nil {
		apiReturn.Error(c, err.Error())
		return
	}
	global.SystemMonitor.Delete(global.SystemMonitor_DOCKER_INFO)
	apiReturn.SuccessData(c, "ok")
}

func (a *MonitorApi) DockerRestart(c *gin.Context) {
	req := dockerActionReq{}
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		apiReturn.ErrorParamFomat(c, err.Error())
		return
	}
	if err := monitor.DockerRestartContainer(req.Container); err != nil {
		apiReturn.Error(c, err.Error())
		return
	}
	global.SystemMonitor.Delete(global.SystemMonitor_DOCKER_INFO)
	apiReturn.SuccessData(c, "ok")
}

type embyCoversReq struct {
	ServerUrl string `json:"serverUrl"`
	ApiKey    string `json:"apiKey"`
	UserId    string `json:"userId"`
	Limit     int    `json:"limit"`
	Height    int    `json:"height"`
}

type embyCoverItem struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Type     string `json:"type,omitempty"`
	ImageUrl string `json:"imageUrl"`
}

func (a *MonitorApi) GetEmbyCovers(c *gin.Context) {
	req := embyCoversReq{}
	if err := c.ShouldBindBodyWith(&req, binding.JSON); err != nil {
		apiReturn.ErrorParamFomat(c, err.Error())
		return
	}

	serverUrl := strings.TrimSpace(req.ServerUrl)
	apiKey := strings.TrimSpace(req.ApiKey)
	userId := strings.TrimSpace(req.UserId)
	if serverUrl == "" || apiKey == "" || userId == "" {
		apiReturn.ErrorParamFomat(c, "serverUrl/apiKey/userId required")
		return
	}

	u, err := url.Parse(serverUrl)
	if err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" {
		apiReturn.ErrorParamFomat(c, "invalid serverUrl")
		return
	}

	base := strings.TrimRight(u.Scheme+"://"+u.Host+strings.TrimRight(u.Path, "/"), "/")
	limit := req.Limit
	if limit <= 0 {
		limit = 30
	}
	if limit > 200 {
		limit = 200
	}
	height := req.Height
	if height <= 0 {
		height = 140
	}
	if height < 80 {
		height = 80
	}
	if height > 260 {
		height = 260
	}

	q := url.Values{}
	q.Set("Recursive", "true")
	q.Set("IncludeItemTypes", "Movie,Series")
	q.Set("SortBy", "DateCreated")
	q.Set("SortOrder", "Descending")
	q.Set("Limit", fmt.Sprintf("%d", limit))
	q.Set("Fields", "PrimaryImageAspectRatio,DateCreated")
	q.Set("ImageTypeLimit", "1")
	q.Set("EnableImageTypes", "Primary")
	q.Set("api_key", apiKey)

	itemsUrl := fmt.Sprintf("%s/Users/%s/Items?%s", base, url.PathEscape(userId), q.Encode())
	httpClient := &http.Client{Timeout: 6 * time.Second}
	httpReq, err := http.NewRequestWithContext(c.Request.Context(), http.MethodGet, itemsUrl, nil)
	if err != nil {
		apiReturn.Error(c, "failed")
		return
	}
	resp, err := httpClient.Do(httpReq)
	if err != nil {
		apiReturn.Error(c, "failed")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		apiReturn.Error(c, "failed")
		return
	}

	type embyItemsResp struct {
		Items []struct {
			ID        string            `json:"Id"`
			Name      string            `json:"Name"`
			Type      string            `json:"Type"`
			ImageTags map[string]string `json:"ImageTags"`
		} `json:"Items"`
	}

	var payload embyItemsResp
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		apiReturn.Error(c, "failed")
		return
	}

	out := make([]embyCoverItem, 0, len(payload.Items))
	for _, it := range payload.Items {
		id := strings.TrimSpace(it.ID)
		if id == "" {
			continue
		}
		tag := ""
		if it.ImageTags != nil {
			tag = strings.TrimSpace(it.ImageTags["Primary"])
		}
		primary := fmt.Sprintf("%s/Items/%s/Images/Primary", base, url.PathEscape(id))
		imgQ := url.Values{}
		imgQ.Set("quality", "90")
		maxHeight := height * 2
		if maxHeight < 240 {
			maxHeight = 240
		}
		imgQ.Set("maxHeight", fmt.Sprintf("%d", maxHeight))
		if tag != "" {
			imgQ.Set("tag", tag)
		}
		imgQ.Set("api_key", apiKey)

		out = append(out, embyCoverItem{
			ID:       id,
			Name:     it.Name,
			Type:     it.Type,
			ImageUrl: primary + "?" + imgQ.Encode(),
		})
	}

	apiReturn.SuccessData(c, out)
}
