package homeassistant

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
)

type HomeAssistantIntegration struct {
	*integration.BaseIntegration
}

func New(id, name, url string, secrets map[string]string) *HomeAssistantIntegration {
	return &HomeAssistantIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindHomeAssistant), url, secrets),
	}
}

func (h *HomeAssistantIntegration) TestConnection(ctx context.Context) error {
	token, err := h.getToken()
	if err != nil {
		return err
	}

	url := h.BuildURL("/api/config")
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := h.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("home assistant connection failed: http %d", resp.StatusCode)
	}

	return nil
}

func (h *HomeAssistantIntegration) GetEntityState(ctx context.Context, entityID string) (string, error) {
	token, err := h.getToken()
	if err != nil {
		return "", err
	}

	url := h.BuildURL("/api/states/" + entityID)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := h.Client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("get entity state failed: http %d", resp.StatusCode)
	}

	var body struct {
		State string `json:"state"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return "", err
	}

	return body.State, nil
}

func (h *HomeAssistantIntegration) ToggleEntity(ctx context.Context, entityID string) error {
	token, err := h.getToken()
	if err != nil {
		return err
	}

	payload := map[string]string{
		"entity_id": entityID,
	}
	buf, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	url := h.BuildURL("/api/services/homeassistant/toggle")
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(buf))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := h.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("toggle entity failed: http %d", resp.StatusCode)
	}

	return nil
}

func (h *HomeAssistantIntegration) ExecuteAutomation(ctx context.Context, automationID string) error {
	token, err := h.getToken()
	if err != nil {
		return err
	}

	payload := map[string]string{
		"entity_id": automationID,
	}
	buf, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	url := h.BuildURL("/api/services/automation/trigger")
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(buf))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := h.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("execute automation failed: http %d", resp.StatusCode)
	}

	return nil
}

func (h *HomeAssistantIntegration) getToken() (string, error) {
	token := h.GetSecret("apiKey")
	if token == "" {
		token = h.GetSecret("token")
	}
	if token == "" {
		return "", fmt.Errorf("home assistant token not configured")
	}
	return token, nil
}
