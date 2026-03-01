package system

import (
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"matrix-panel/lib/monitor"
)

func TestPhysicalDiskKey(t *testing.T) {
	cases := []struct {
		name      string
		device    string
		mount     string
		want      string
		wantEmpty bool
	}{
		{name: "nvme-partition", device: "/dev/nvme0n1p1", mount: "/", want: "/dev/nvme0n1"},
		{name: "sda-partition", device: "/dev/sda1", mount: "/", want: "/dev/sda"},
		{name: "mapper", device: "/dev/mapper/ubuntu--vg-root", mount: "/", want: "/dev/mapper/ubuntu--vg-root"},
		{name: "overlay-empty", device: "overlay", mount: "/", wantEmpty: true},
		{name: "tmpfs-empty", device: "tmpfs", mount: "/run", wantEmpty: true},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := physicalDiskKey(tc.device, tc.mount)
			if tc.wantEmpty {
				if got != "" {
					t.Fatalf("physicalDiskKey() = %q, want empty", got)
				}
				return
			}
			if got != tc.want {
				t.Fatalf("physicalDiskKey() = %q, want %q", got, tc.want)
			}
		})
	}
}

func TestGetContainerDetectInfo(t *testing.T) {
	info := monitor.GetContainerDetectInfo()
	if info.Hostname == "" {
		t.Fatalf("hostname empty")
	}
	if len(info.DockerSocketCandidates) == 0 {
		t.Fatalf("docker socket candidates empty")
	}
	if info.InContainer != (len(info.Indicators) > 0) {
		t.Fatalf("inContainer mismatch: %v indicators=%v", info.InContainer, info.Indicators)
	}
}

func TestGetMemoryInfoFromPrometheus(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		q := r.URL.Query().Get("query")
		var v string
		switch {
		case strings.Contains(q, "node_memory_MemTotal_bytes"):
			v = "1000"
		case strings.Contains(q, "node_memory_MemAvailable_bytes"):
			v = "250"
		default:
			w.WriteHeader(http.StatusBadRequest)
			_, _ = w.Write([]byte(`{"status":"error","error":"unknown query"}`))
			return
		}
		_, _ = w.Write([]byte(`{"status":"success","data":{"resultType":"vector","result":[{"metric":{},"value":[1700000000,"` + v + `"]}]}}`))
	}))
	defer srv.Close()

	t.Setenv("MONITOR_PROMETHEUS_URL", srv.URL)
	os.Unsetenv("PROMETHEUS_URL")

	got, ok, err := monitor.GetMemoryInfoFromPrometheus()
	if err != nil {
		t.Fatalf("unexpected err: %v", err)
	}
	if !ok {
		t.Fatalf("expected ok")
	}
	if got.Total != 1000 || got.Free != 250 || got.Used != 750 {
		t.Fatalf("unexpected memory: %+v", got)
	}
	if got.UsedPercent != 75 {
		t.Fatalf("unexpected usedPercent: %v", got.UsedPercent)
	}
}
