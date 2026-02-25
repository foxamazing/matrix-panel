package tdarr

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

// TdarrIntegration Tdarr 媒体转码集成
type TdarrIntegration struct {
	*integration.BaseIntegration
}

// New 创建 Tdarr 集成实例
func New(id, name, url string, secrets map[string]string) *TdarrIntegration {
	return &TdarrIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindTdarr), url, secrets),
	}
}

// TestConnection 测试 Tdarr 连接
func (t *TdarrIntegration) TestConnection(ctx context.Context) error {
	apiKey := t.GetSecret("apiKey")

	reqBody, _ := json.Marshal(map[string]any{
		"data": map[string]any{},
	})

	url := t.BuildURL("/api/v2/is-server-alive")
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(reqBody))
	if err != nil {
		return fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	if apiKey != "" {
		req.Header.Set("X-Api-Key", apiKey)
	}

	resp, err := t.Client.Do(req)
	if err != nil {
		return fmt.Errorf("连接失败: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("服务器返回错误状态: %d", resp.StatusCode)
	}

	return nil
}

// GetStatistics 获取统计信息
func (t *TdarrIntegration) GetStatistics(ctx context.Context) (*integration.TdarrStatistics, error) {
	apiKey := t.GetSecret("apiKey")

	reqBody, _ := json.Marshal(map[string]any{
		"data": map[string]any{
			"libraryId": "",
		},
	})

	url := t.BuildURL("/api/v2/stats/get-pies")
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(reqBody))
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/json")
	if apiKey != "" {
		req.Header.Set("X-Api-Key", apiKey)
	}

	resp, err := t.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("请求失败: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取统计失败: HTTP %d", resp.StatusCode)
	}

	var raw struct {
		PieStats struct {
			TotalFiles            int `json:"totalFiles"`
			TotalTranscodeCount   int `json:"totalTranscodeCount"`
			TotalHealthCheckCount int `json:"totalHealthCheckCount"`
			Status                struct {
				Transcode   []integration.TdarrPieSegment `json:"transcode"`
				Healthcheck []integration.TdarrPieSegment `json:"healthcheck"`
			} `json:"status"`
			SizeDiff float64 `json:"sizeDiff"`
			Video    struct {
				Codecs      []integration.TdarrPieSegment `json:"codecs"`
				Containers  []integration.TdarrPieSegment `json:"containers"`
				Resolutions []integration.TdarrPieSegment `json:"resolutions"`
			} `json:"video"`
			Audio struct {
				Codecs     []integration.TdarrPieSegment `json:"codecs"`
				Containers []integration.TdarrPieSegment `json:"containers"`
			} `json:"audio"`
		} `json:"pieStats"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, fmt.Errorf("解析统计响应失败: %w", err)
	}

	stats := &integration.TdarrStatistics{
		LibraryName:            "All",
		TotalFileCount:         raw.PieStats.TotalFiles,
		TotalTranscodeCount:    raw.PieStats.TotalTranscodeCount,
		TotalHealthCheckCount:  raw.PieStats.TotalHealthCheckCount,
		FailedTranscodeCount:   findPieValue(raw.PieStats.Status.Transcode, "Transcode error"),
		FailedHealthCheckCount: findPieValue(raw.PieStats.Status.Healthcheck, "Error"),
		StagedTranscodeCount:   findPieValue(raw.PieStats.Status.Transcode, "Transcode success"),
		StagedHealthCheckCount: findPieValue(raw.PieStats.Status.Healthcheck, "Queued"),
		TotalSavedSpace:        int64(raw.PieStats.SizeDiff * 1_000_000_000), // GB -> bytes
		TranscodeStatus:        raw.PieStats.Status.Transcode,
		HealthCheckStatus:      raw.PieStats.Status.Healthcheck,
		VideoCodecs:            raw.PieStats.Video.Codecs,
		VideoContainers:        raw.PieStats.Video.Containers,
		VideoResolutions:       raw.PieStats.Video.Resolutions,
		AudioCodecs:            raw.PieStats.Audio.Codecs,
		AudioContainers:        raw.PieStats.Audio.Containers,
	}

	return stats, nil
}

// GetWorkers 获取当前 Workers
func (t *TdarrIntegration) GetWorkers(ctx context.Context) ([]integration.TdarrWorker, error) {
	apiKey := t.GetSecret("apiKey")

	url := t.BuildURL("/api/v2/get-nodes")
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if apiKey != "" {
		req.Header.Set("X-Api-Key", apiKey)
	}

	resp, err := t.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("请求失败: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取节点失败: HTTP %d", resp.StatusCode)
	}

	var nodes map[string]struct {
		Workers map[string]struct {
			ID         string  `json:"_id"`
			File       string  `json:"file"`
			FPS        float64 `json:"fps"`
			Percentage float64 `json:"percentage"`
			ETA        string  `json:"ETA"`
			Job        struct {
				Type string `json:"type"`
			} `json:"job"`
			Status            string `json:"status"`
			LastPluginDetails struct {
				Number string `json:"number"`
			} `json:"lastPluginDetails"`
			OriginalFileSizeInGBytes float64  `json:"originalfileSizeInGbytes"`
			EstimatedSizeInGBytes    *float64 `json:"estSize"`
			OutputFileSizeInGBytes   *float64 `json:"outputFileSizeInGbytes"`
		} `json:"workers"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&nodes); err != nil {
		return nil, fmt.Errorf("解析节点响应失败: %w", err)
	}

	var workers []integration.TdarrWorker
	for _, node := range nodes {
		for _, w := range node.Workers {
			worker := integration.TdarrWorker{
				ID:           w.ID,
				FilePath:     w.File,
				FPS:          w.FPS,
				Percentage:   w.Percentage,
				ETA:          w.ETA,
				JobType:      w.Job.Type,
				Status:       w.Status,
				Step:         w.LastPluginDetails.Number,
				OriginalSize: int64(w.OriginalFileSizeInGBytes * 1_000_000_000), // GB -> bytes
			}

			if w.EstimatedSizeInGBytes != nil {
				est := int64(*w.EstimatedSizeInGBytes * 1_000_000_000)
				worker.EstimatedSize = &est
			}
			if w.OutputFileSizeInGBytes != nil {
				out := int64(*w.OutputFileSizeInGBytes * 1_000_000_000)
				worker.OutputSize = &out
			}

			workers = append(workers, worker)
		}
	}

	return workers, nil
}

// GetQueue 获取队列（转码 + 健康检查）
func (t *TdarrIntegration) GetQueue(ctx context.Context, firstItemIndex, pageSize int) (*integration.TdarrQueue, error) {
	transcodes, err := t.getStatusTable(ctx, firstItemIndex, pageSize, "table1")
	if err != nil {
		return nil, err
	}

	healthChecks, err := t.getStatusTable(ctx, max(firstItemIndex-transcodes.TotalCount, 0), pageSize, "table4")
	if err != nil {
		return nil, err
	}

	combined := append(transcodes.Array, healthChecks.Array...)
	if len(combined) > pageSize {
		combined = combined[:pageSize]
	}

	queue := &integration.TdarrQueue{
		Array:      combined,
		TotalCount: transcodes.TotalCount + healthChecks.TotalCount,
		StartIndex: firstItemIndex,
		EndIndex:   firstItemIndex + len(combined) - 1,
	}

	return queue, nil
}

// 内部方法：获取指定表的队列数据
func (t *TdarrIntegration) getStatusTable(ctx context.Context, start, pageSize int, table string) (*integration.TdarrQueue, error) {
	apiKey := t.GetSecret("apiKey")

	reqBody, _ := json.Marshal(map[string]any{
		"data": map[string]any{
			"start":    start,
			"pageSize": pageSize,
			"filters":  []any{},
			"sorts":    []any{},
			"opts": map[string]any{
				"table": table,
			},
		},
	})

	url := t.BuildURL("/api/v2/client/status-tables")
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(reqBody))
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if apiKey != "" {
		req.Header.Set("X-Api-Key", apiKey)
	}

	resp, err := t.Client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("请求失败: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("获取队列失败: HTTP %d", resp.StatusCode)
	}

	var raw struct {
		Array []struct {
			ID                     string  `json:"_id"`
			HealthCheck            string  `json:"HealthCheck"`
			TranscodeDecisionMaker string  `json:"TranscodeDecisionMaker"`
			File                   string  `json:"file"`
			FileSizeMB             float64 `json:"file_size"`
			Container              string  `json:"container"`
			VideoCodecName         string  `json:"video_codec_name"`
			VideoResolution        string  `json:"video_resolution"`
		} `json:"array"`
		TotalCount int `json:"totalCount"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, fmt.Errorf("解析队列响应失败: %w", err)
	}

	items := make([]integration.TdarrQueueItem, 0, len(raw.Array))
	itemType := "transcode"
	if table == "table4" {
		itemType = "health-check"
	}

	for _, item := range raw.Array {
		items = append(items, integration.TdarrQueueItem{
			ID:          item.ID,
			HealthCheck: item.HealthCheck,
			Transcode:   item.TranscodeDecisionMaker,
			FilePath:    item.File,
			FileSize:    int64(item.FileSizeMB * 1_000_000), // MB -> bytes
			Container:   item.Container,
			Codec:       item.VideoCodecName,
			Resolution:  item.VideoResolution,
			Type:        itemType,
		})
	}

	return &integration.TdarrQueue{
		Array:      items,
		TotalCount: raw.TotalCount,
		StartIndex: start,
		EndIndex:   start + len(items) - 1,
	}, nil
}

// 工具函数：在饼图分段中查找指定名称的值
func findPieValue(segments []integration.TdarrPieSegment, name string) int {
	for _, s := range segments {
		if s.Name == name {
			return s.Value
		}
	}
	return 0
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
