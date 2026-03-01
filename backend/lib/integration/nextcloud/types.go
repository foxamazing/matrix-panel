package nextcloud

type ServerInfo struct {
	Version     string `json:"version"`
	FreeSpace   int64  `json:"freeSpace"`
	ActiveUsers int    `json:"activeUsers"`
}

type NextcloudServerInfo struct {
	Nextcloud struct {
		System struct {
			Version   string `json:"version"`
			Freespace int64  `json:"freespace"`
		} `json:"system"`
	} `json:"nextcloud"`
	ActiveUsers struct {
		Last24Hours int `json:"last24hours"`
	} `json:"activeUsers"`
}
