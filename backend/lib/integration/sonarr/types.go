package sonarr

import "time"

// CalendarEvent 日历事件
type CalendarEvent struct {
	Title       string    `json:"title"`
	SubTitle    string    `json:"subTitle"`
	Description string    `json:"description"`
	StartDate   time.Time `json:"startDate"`
	ImageURL    string    `json:"imageUrl"`
	Season      int       `json:"season"`
	Episode     int       `json:"episode"`
	SeriesSlug  string    `json:"seriesSlug"`
	IMDbID      string    `json:"imdbId"`
}

// Series 剧集信息
type Series struct {
	ID        int     `json:"id"`
	Title     string  `json:"title"`
	TitleSlug string  `json:"titleSlug"`
	Status    string  `json:"status"`
	Overview  string  `json:"overview"`
	Network   string  `json:"network"`
	Year      int     `json:"year"`
	Seasons   int     `json:"seasons"`
	PosterURL string  `json:"posterUrl"`
	IMDbID    string  `json:"imdbId"`
	TVDbID    int     `json:"tvdbId"`
	Rating    float64 `json:"rating"`
	Monitored bool    `json:"monitored"`
}

// QueueItem 下载队列项
type QueueItem struct {
	ID                    int    `json:"id"`
	SeriesTitle           string `json:"seriesTitle"`
	EpisodeTitle          string `json:"episodeTitle"`
	Season                int    `json:"season"`
	Episode               int    `json:"episode"`
	Quality               string `json:"quality"`
	Size                  int64  `json:"size"`
	SizeLeft              int64  `json:"sizeLeft"`
	Status                string `json:"status"`
	TrackedDownloadStatus string `json:"trackedDownloadStatus"`
	ErrorMessage          string `json:"errorMessage"`
}

// SearchResult 搜索结果
type SearchResult struct {
	Title     string `json:"title"`
	TitleSlug string `json:"titleSlug"`
	Year      int    `json:"year"`
	Overview  string `json:"overview"`
	Network   string `json:"network"`
	Status    string `json:"status"`
	PosterURL string `json:"posterUrl"`
	IMDbID    string `json:"imdbId"`
	TVDbID    int    `json:"tvdbId"`
}

// Sonarr API 响应结构

// SonarrImage 图片信息
type SonarrImage struct {
	CoverType string `json:"coverType"` // poster, banner, fanart, screenshot, headshot, clearlogo
	RemoteURL string `json:"remoteUrl"`
	URL       string `json:"url"`
}

// SonarrSeries Sonarr剧集
type SonarrSeries struct {
	ID        int            `json:"id"`
	Title     string         `json:"title"`
	TitleSlug string         `json:"titleSlug"`
	Status    string         `json:"status"` // continuing, ended
	Overview  string         `json:"overview"`
	Network   string         `json:"network"`
	Year      int            `json:"year"`
	Seasons   []SonarrSeason `json:"seasons"`
	Images    []SonarrImage  `json:"images"`
	IMDbID    string         `json:"imdbId"`
	TVDbID    int            `json:"tvdbId"`
	Ratings   SonarrRating   `json:"ratings"`
	Monitored bool           `json:"monitored"`
}

// SonarrSeason 季度信息
type SonarrSeason struct {
	SeasonNumber int  `json:"seasonNumber"`
	Monitored    bool `json:"monitored"`
}

// SonarrRating 评分
type SonarrRating struct {
	Votes int     `json:"votes"`
	Value float64 `json:"value"`
}

// SonarrCalendarEvent 日历事件
type SonarrCalendarEvent struct {
	ID            int                  `json:"id"`
	SeriesID      int                  `json:"seriesId"`
	EpisodeFileID int                  `json:"episodeFileId"`
	Title         string               `json:"title"`
	AirDateUTC    time.Time            `json:"airDateUtc"`
	SeasonNumber  int                  `json:"seasonNumber"`
	EpisodeNumber int                  `json:"episodeNumber"`
	HasFile       bool                 `json:"hasFile"`
	Monitored     bool                 `json:"monitored"`
	Series        SonarrCalendarSeries `json:"series"`
	Images        []SonarrImage        `json:"images"`
}

// SonarrCalendarSeries 日历中的剧集信息
type SonarrCalendarSeries struct {
	Title     string        `json:"title"`
	TitleSlug string        `json:"titleSlug"`
	Overview  string        `json:"overview"`
	Images    []SonarrImage `json:"images"`
	IMDbID    string        `json:"imdbId"`
}

// SonarrQueueItem 队列项
type SonarrQueueItem struct {
	ID                    int                `json:"id"`
	SeriesID              int                `json:"seriesId"`
	EpisodeID             int                `json:"episodeId"`
	Size                  int64              `json:"size"`
	Sizeleft              int64              `json:"sizeleft"`
	Status                string             `json:"status"`
	TrackedDownloadStatus string             `json:"trackedDownloadStatus"`
	ErrorMessage          string             `json:"errorMessage"`
	Series                SonarrQueueSeries  `json:"series"`
	Episode               SonarrQueueEpisode `json:"episode"`
	Quality               SonarrQueueQuality `json:"quality"`
}

// SonarrQueueSeries 队列中的剧集
type SonarrQueueSeries struct {
	Title string `json:"title"`
}

// SonarrQueueEpisode 队列中的集
type SonarrQueueEpisode struct {
	Title         string `json:"title"`
	SeasonNumber  int    `json:"seasonNumber"`
	EpisodeNumber int    `json:"episodeNumber"`
}

// SonarrQueueQuality 质量信息
type SonarrQueueQuality struct {
	Quality SonarrQualityDefinition `json:"quality"`
}

// SonarrQualityDefinition 质量定义
type SonarrQualityDefinition struct {
	Name string `json:"name"`
}

// SonarrSearchResult 搜索结果
type SonarrSearchResult struct {
	Title     string        `json:"title"`
	TitleSlug string        `json:"titleSlug"`
	Year      int           `json:"year"`
	Overview  string        `json:"overview"`
	Network   string        `json:"network"`
	Status    string        `json:"status"`
	Images    []SonarrImage `json:"images"`
	IMDbID    string        `json:"imdbId"`
	TVDbID    int           `json:"tvdbId"`
}
