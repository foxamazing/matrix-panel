package sabnzbd

type QueueInfo struct {
	Speed     string     `json:"speed"`
	SizeLeft  string     `json:"sizeLeft"`
	TotalSize string     `json:"totalSize"`
	TimeLeft  string     `json:"timeLeft"`
	Status    string     `json:"status"`
	JobCount  int        `json:"jobCount"`
	Jobs      []QueueJob `json:"jobs"`
}

type QueueJob struct {
	Name     string  `json:"name"`
	Size     string  `json:"size"`
	SizeLeft string  `json:"sizeLeft"`
	Progress float64 `json:"progress"`
	Status   string  `json:"status"`
}

type SABQueue struct {
	Speed    string    `json:"speed"`
	MBLeft   string    `json:"mbleft"`
	MB       string    `json:"mb"`
	TimeLeft string    `json:"timeleft"`
	Status   string    `json:"status"`
	Slots    []SABSlot `json:"slots"`
}

type SABSlot struct {
	Filename   string  `json:"filename"`
	MB         string  `json:"mb"`
	MBLeft     string  `json:"mbleft"`
	Percentage float64 `json:"percentage"`
	Status     string  `json:"status"`
}
