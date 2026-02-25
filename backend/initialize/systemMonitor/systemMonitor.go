package systemMonitor

import (
	"matrix-panel/global"
	"matrix-panel/lib/cache"
	"matrix-panel/lib/monitor"
	"sync"
	"time"
)

func Start(cacher cache.Cacher[interface{}], interval time.Duration) {
	go func() {

		ticker := time.NewTicker(interval)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				go func() {
					monitorInfo := GetInfo()
					// jsonByte, _ := json.Marshal(monitorInfo)
					// fmt.Println("系统监控信息", string(jsonByte))
					cacher.SetDefault("value", monitorInfo)
				}()
			}
		}

	}()

}

func GetInfo() global.ModelSystemMonitor {
	var modelSystemMonitor global.ModelSystemMonitor
	var wg sync.WaitGroup

	// Parallelize collection
	wg.Add(6)

	go func() {
		defer wg.Done()
		if v, err := monitor.GetCPUInfo(); err == nil {
			modelSystemMonitor.CPUInfo = v
		}
	}()
	go func() {
		defer wg.Done()
		if v, err := monitor.GetDiskInfo(); err == nil {
			modelSystemMonitor.DiskInfo = v
		}
	}()
	go func() {
		defer wg.Done()
		if v, err := monitor.GetNetIOCountersInfo(); err == nil {
			modelSystemMonitor.NetIOCountersInfo = v
		}
	}()
	go func() {
		defer wg.Done()
		if v, err := monitor.GetMemoryInfo(); err == nil {
			modelSystemMonitor.MemoryInfo = v
		}
	}()
	go func() {
		defer wg.Done()
		if v, err := monitor.GetGPUInfo(); err == nil {
			modelSystemMonitor.GPUInfo = v
		}
	}()
	go func() {
		defer wg.Done()
		if v, err := monitor.GetDockerContainers(); err == nil {
			modelSystemMonitor.DockerInfo = v
		}
	}()

	wg.Wait()

	// PowerInfo derives from GPUInfo, so it must be calculated afterwards if needed,
	// or we just calculate it from the model.
	var totalPower float64
	for _, g := range modelSystemMonitor.GPUInfo {
		totalPower += g.Power
	}
	modelSystemMonitor.PowerInfo.Total = totalPower

	return modelSystemMonitor
}
