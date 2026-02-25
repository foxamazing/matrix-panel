package lidarr

import "time"

type CalendarEvent struct {
	Title       string    `json:"title"`
	Artist      string    `json:"artist"`
	ReleaseDate time.Time `json:"releaseDate"`
}

type Artist struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Overview  string `json:"overview"`
	Monitored bool   `json:"monitored"`
}

type LidarrArtist struct {
	ID         int    `json:"id"`
	ArtistName string `json:"artistName"`
	Overview   string `json:"overview"`
	Monitored  bool   `json:"monitored"`
}

type LidarrCalendarEvent struct {
	Title       string    `json:"title"`
	ReleaseDate time.Time `json:"releaseDate"`
	Artist      struct {
		ArtistName string `json:"artistName"`
	} `json:"artist"`
}
