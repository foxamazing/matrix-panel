package overseerr

type MediaRequest struct {
	ID          int       `json:"id"`
	Type        string    `json:"type"`
	Status      int       `json:"status"`
	RequestedBy string    `json:"requestedBy"`
	Media       MediaInfo `json:"media"`
}

type MediaInfo struct {
	Title     string `json:"title"`
	PosterURL string `json:"posterUrl"`
}

type RequestStats struct {
	Total     int `json:"total"`
	Pending   int `json:"pending"`
	Approved  int `json:"approved"`
	Available int `json:"available"`
}

type OverseerrRequest struct {
	ID          int    `json:"id"`
	Type        string `json:"type"`
	Status      int    `json:"status"`
	RequestedBy struct {
		DisplayName string `json:"displayName"`
	} `json:"requestedBy"`
	Media struct {
		Title      string `json:"title"`
		PosterPath string `json:"posterPath"`
	} `json:"media"`
}
