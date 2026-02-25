package prowlarr

type Indexer struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Protocol string `json:"protocol"`
	Enable   bool   `json:"enable"`
}

type IndexerStats struct {
	TotalIndexers   int `json:"totalIndexers"`
	EnabledIndexers int `json:"enabledIndexers"`
	TotalQueries    int `json:"totalQueries"`
	TotalGrabs      int `json:"totalGrabs"`
}

type ProwlarrIndexer struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Protocol string `json:"protocol"`
	Enable   bool   `json:"enable"`
}

type ProwlarrIndexerStats struct {
	Indexers     []ProwlarrIndexer `json:"indexers"`
	TotalQueries int               `json:"totalQueries"`
	TotalGrabs   int               `json:"totalGrabs"`
}
