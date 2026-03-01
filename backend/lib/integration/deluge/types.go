package deluge

type TorrentInfo struct {
	Hash      string  `json:"hash"`
	Name      string  `json:"name"`
	State     string  `json:"state"`
	Progress  float64 `json:"progress"`
	DownSpeed int64   `json:"downSpeed"`
	UpSpeed   int64   `json:"upSpeed"`
	ETA       int     `json:"eta"`
	Ratio     float64 `json:"ratio"`
}

type DelugeTorrent struct {
	Name         string  `json:"name"`
	State        string  `json:"state"`
	Progress     float64 `json:"progress"`
	DownloadRate int64   `json:"download_payload_rate"`
	UploadRate   int64   `json:"upload_payload_rate"`
	ETA          int     `json:"eta"`
	Ratio        float64 `json:"ratio"`
}
