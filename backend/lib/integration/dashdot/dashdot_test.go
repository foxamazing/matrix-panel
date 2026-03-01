package dashdot

import (
	"testing"
)

func TestNewDashdotIntegration(t *testing.T) {
	integration := NewDashdotIntegration("http://localhost:3001")

	if integration.BaseURL != "http://localhost:3001" {
		t.Errorf("Expected BaseURL to be http://localhost:3001, got %s", integration.BaseURL)
	}

	if integration.client == nil {
		t.Error("Expected client to be initialized")
	}
}

// Note: Real integration tests require a running Dashdot instance
// For now, we only test initialization
