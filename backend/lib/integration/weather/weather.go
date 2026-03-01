package weather

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

// WeatherResponse Open-Meteo 响应结构
type WeatherResponse struct {
	CurrentWeather struct {
		Temperature float64 `json:"temperature"`
		WindSpeed   float64 `json:"windspeed"`
		WeatherCode int     `json:"weathercode"`
	} `json:"current_weather"`
	Daily struct {
		Time             []string  `json:"time"`
		WeatherCode      []int     `json:"weathercode"`
		Temperature2mMax []float64 `json:"temperature_2m_max"`
		Temperature2mMin []float64 `json:"temperature_2m_min"`
		Sunrise          []string  `json:"sunrise"`
		Sunset           []string  `json:"sunset"`
		WindSpeed10mMax  []float64 `json:"wind_speed_10m_max"`
	} `json:"daily"`
}

// WeatherData 统一的天气数据格式
type WeatherData struct {
	Current struct {
		Temperature float64 `json:"temperature"`
		WindSpeed   float64 `json:"windspeed"`
		WeatherCode int     `json:"weatherCode"`
	} `json:"current"`
	Daily []DailyForecast `json:"daily"`
}

type DailyForecast struct {
	Date        string  `json:"date"`
	WeatherCode int     `json:"weatherCode"`
	MaxTemp     float64 `json:"maxTemp"`
	MinTemp     float64 `json:"minTemp"`
	Sunrise     string  `json:"sunrise"`
	Sunset      string  `json:"sunset"`
	WindSpeed   float64 `json:"windSpeed"`
}

// Cache 缓存天气数据
var (
	cache     = make(map[string]cachedItem)
	cacheLock sync.Mutex
)

type cachedItem struct {
	Data      *WeatherData
	ExpiresAt time.Time
}

// GetWeather 获取指定坐标的天气数据
func GetWeather(lat, long float64) (*WeatherData, error) {
	key := fmt.Sprintf("%.4f,%.4f", lat, long)

	cacheLock.Lock()
	if item, ok := cache[key]; ok && time.Now().Before(item.ExpiresAt) {
		cacheLock.Unlock()
		return item.Data, nil
	}
	cacheLock.Unlock()

	// 抓取新数据
	url := fmt.Sprintf("https://api.open-meteo.com/v1/forecast?latitude=%.6f&longitude=%.6f&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,wind_speed_10m_max&current_weather=true&timezone=auto", lat, long)

	client := &http.Client{Timeout: 8 * time.Second}
	req, err := http.NewRequestWithContext(context.Background(), http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("weather API error: %d", resp.StatusCode)
	}

	var raw WeatherResponse
	if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
		return nil, err
	}

	// 转换数据格式
	data := &WeatherData{}
	data.Current.Temperature = raw.CurrentWeather.Temperature
	data.Current.WindSpeed = raw.CurrentWeather.WindSpeed
	data.Current.WeatherCode = raw.CurrentWeather.WeatherCode

	count := len(raw.Daily.Time)
	for _, n := range []int{
		len(raw.Daily.WeatherCode),
		len(raw.Daily.Temperature2mMax),
		len(raw.Daily.Temperature2mMin),
		len(raw.Daily.Sunrise),
		len(raw.Daily.Sunset),
		len(raw.Daily.WindSpeed10mMax),
	} {
		if n < count {
			count = n
		}
	}

	for i := 0; i < count; i++ {
		forecast := DailyForecast{
			Date:        raw.Daily.Time[i],
			WeatherCode: raw.Daily.WeatherCode[i],
			MaxTemp:     raw.Daily.Temperature2mMax[i],
			MinTemp:     raw.Daily.Temperature2mMin[i],
			Sunrise:     raw.Daily.Sunrise[i],
			Sunset:      raw.Daily.Sunset[i],
			WindSpeed:   raw.Daily.WindSpeed10mMax[i],
		}
		data.Daily = append(data.Daily, forecast)
	}

	// 更新缓存 (5分钟过期)
	cacheLock.Lock()
	cache[key] = cachedItem{
		Data:      data,
		ExpiresAt: time.Now().Add(5 * time.Minute),
	}
	cacheLock.Unlock()

	return data, nil
}
