package radarr

import "time"

type CalendarEvent struct {
	Title       string    `json:"title"`
	ReleaseDate time.Time `json:"releaseDate"`
	ImageURL    string    `json:"imageUrl"`
	Year        int       `json:"year"`
	TitleSlug   string    `json:"titleSlug"`
	IMDbID      string    `json:"imdbId"`
	TMDbID      int       `json:"tmdbId"`
}

type Movie struct {
	ID        int     `json:"id"`
	Title     string  `json:"title"`
	TitleSlug string  `json:"titleSlug"`
	Status    string  `json:"status"`
	Overview  string  `json:"overview"`
	Year      int     `json:"year"`
	PosterURL string  `json:"posterUrl"`
	IMDbID    string  `json:"imdbId"`
	TMDbID    int     `json:"tmdbId"`
	Rating    float64 `json:"rating"`
	Monitored bool    `json:"monitored"`
}

type QueueItem struct {
	ID       int    `json:"id"`
	Title    string `json:"title"`
	Quality  string `json:"quality"`
	Size     int64  `json:"size"`
	SizeLeft int64  `json:"sizeLeft"`
	Status   string `json:"status"`
}

type RadarrImage struct {
	CoverType string `json:"coverType"`
	RemoteURL string `json:"remoteUrl"`
}

type RadarrMovie struct {
	ID        int           `json:"id"`
	Title     string        `json:"title"`
	TitleSlug string        `json:"titleSlug"`
	Status    string        `json:"status"`
	Overview  string        `json:"overview"`
	Year      int           `json:"year"`
	Images    []RadarrImage `json:"images"`
	IMDbID    string        `json:"imdbId"`
	TMDbID    int           `json:"tmdbId"`
	Ratings   struct {
		Value float64 `json:"value"`
	} `json:"ratings"`
	Monitored bool `json:"monitored"`
}

type RadarrCalendarEvent struct {
	Title     string        `json:"title"`
	TitleSlug string        `json:"titleSlug"`
	Year      int           `json:"year"`
	InCinemas time.Time     `json:"inCinemas"`
	Images    []RadarrImage `json:"images"`
	IMDbID    string        `json:"imdbId"`
	TMDbID    int           `json:"tmdbId"`
}

type RadarrQueueItem struct {
	ID       int    `json:"id"`
	Size     int64  `json:"size"`
	Sizeleft int64  `json:"sizeleft"`
	Status   string `json:"status"`
	Movie    struct {
		Title string `json:"title"`
	} `json:"movie"`
	Quality struct {
		Quality struct {
			Name string `json:"name"`
		} `json:"quality"`
	} `json:"quality"`
}
