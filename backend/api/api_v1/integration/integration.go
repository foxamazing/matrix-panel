package integration

import (
	"context"
	"strings"
	"time"

	"matrix-panel/api/api_v1/common/apiReturn"
	"matrix-panel/db"
	adguardlib "matrix-panel/lib/integration/adguard"
	aria2lib "matrix-panel/lib/integration/aria2"
	dashdotlib "matrix-panel/lib/integration/dashdot"
	dockerlib "matrix-panel/lib/integration/docker"
	dockerhublib "matrix-panel/lib/integration/dockerhub"
	embylib "matrix-panel/lib/integration/emby"
	gitlablib "matrix-panel/lib/integration/gitlab"
	icallib "matrix-panel/lib/integration/ical"
	jellyfinlib "matrix-panel/lib/integration/jellyfin"
	jellyseerrlib "matrix-panel/lib/integration/jellyseerr"
	lidarrlib "matrix-panel/lib/integration/lidarr"
	overseerrlib "matrix-panel/lib/integration/overseerr"
	piholelib "matrix-panel/lib/integration/pihole"
	plexlib "matrix-panel/lib/integration/plex"
	prowlarrlib "matrix-panel/lib/integration/prowlarr"
	qbittorrentlib "matrix-panel/lib/integration/qbittorrent"
	radarrlib "matrix-panel/lib/integration/radarr"
	readarrlib "matrix-panel/lib/integration/readarr"
	sonarrlib "matrix-panel/lib/integration/sonarr"
	uptimekumalib "matrix-panel/lib/integration/uptimekuma"
	"matrix-panel/models"

	"github.com/gin-gonic/gin"
)

// CreateIntegration creates integration config.
func CreateIntegration(c *gin.Context) {
	var req struct {
		Name    string            `json:"name" binding:"required"`
		Kind    string            `json:"kind" binding:"required"`
		URL     string            `json:"url" binding:"required"`
		Icon    string            `json:"icon"`
		Secrets map[string]string `json:"secrets"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		apiReturn.ErrorParamFomat(c, err.Error())
		return
	}

	integration := models.Integration{
		Name:   req.Name,
		Kind:   req.Kind,
		URL:    req.URL,
		Icon:   req.Icon,
		Enable: true,
	}
	if req.Secrets != nil {
		integration.SecretMap = req.Secrets
	}

	if err := db.DB.Create(&integration).Error; err != nil {
		apiReturn.ErrorDatabase(c, err.Error())
		return
	}
	apiReturn.SuccessData(c, integration)
}

// GetIntegrations returns integration list.
func GetIntegrations(c *gin.Context) {
	var integrations []models.Integration
	if err := db.DB.Find(&integrations).Error; err != nil {
		apiReturn.ErrorDatabase(c, err.Error())
		return
	}
	for i := range integrations {
		integrations[i].AfterFind()
	}
	apiReturn.SuccessData(c, integrations)
}

// GetIntegration returns one integration by id.
func GetIntegration(c *gin.Context) {
	id := c.Param("id")
	var integration models.Integration
	if err := db.DB.First(&integration, "id = ?", id).Error; err != nil {
		apiReturn.ErrorDataNotFound(c)
		return
	}
	integration.AfterFind()
	apiReturn.SuccessData(c, integration)
}

// UpdateIntegration updates integration fields.
func UpdateIntegration(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Name    *string           `json:"name"`
		URL     *string           `json:"url"`
		Icon    *string           `json:"icon"`
		Enable  *bool             `json:"enable"`
		Secrets map[string]string `json:"secrets"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		apiReturn.ErrorParamFomat(c, err.Error())
		return
	}

	var integration models.Integration
	if err := db.DB.First(&integration, "id = ?", id).Error; err != nil {
		apiReturn.ErrorDataNotFound(c)
		return
	}

	updates := make(map[string]interface{})
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.URL != nil {
		updates["url"] = *req.URL
	}
	if req.Icon != nil {
		updates["icon"] = *req.Icon
	}
	if req.Enable != nil {
		updates["enable"] = *req.Enable
	}
	if req.Secrets != nil {
		integration.SecretMap = req.Secrets
		integration.BeforeSave()
		updates["secrets"] = integration.Secrets
	}

	if err := db.DB.Model(&integration).Updates(updates).Error; err != nil {
		apiReturn.ErrorDatabase(c, err.Error())
		return
	}

	if err := db.DB.First(&integration, "id = ?", id).Error; err != nil {
		apiReturn.ErrorDatabase(c, err.Error())
		return
	}
	integration.AfterFind()
	apiReturn.SuccessData(c, integration)
}

// DeleteIntegration deletes integration by id.
func DeleteIntegration(c *gin.Context) {
	id := c.Param("id")
	result := db.DB.Delete(&models.Integration{}, "id = ?", id)
	if result.Error != nil {
		apiReturn.ErrorDatabase(c, result.Error.Error())
		return
	}
	if result.RowsAffected == 0 {
		apiReturn.ErrorDataNotFound(c)
		return
	}
	apiReturn.Success(c)
}

// TestIntegration tests external integration connectivity by kind.
func TestIntegration(c *gin.Context) {
	var req struct {
		Kind    string            `json:"kind" binding:"required"`
		URL     string            `json:"url" binding:"required"`
		Secrets map[string]string `json:"secrets"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		apiReturn.ErrorParamFomat(c, err.Error())
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	kind := strings.ToLower(strings.TrimSpace(req.Kind))
	var err error

	switch kind {
	case "dashdot":
		err = dashdotlib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "ical":
		err = icallib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "gitlab":
		err = gitlablib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "docker":
		err = dockerlib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "dockerhub":
		err = dockerhublib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "uptimekuma":
		err = uptimekumalib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "plex":
		err = plexlib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "qbittorrent":
		err = qbittorrentlib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "adguard":
		err = adguardlib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "pihole":
		err = piholelib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "aria2":
		err = aria2lib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "jellyfin":
		err = jellyfinlib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "emby":
		err = embylib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "overseerr":
		err = overseerrlib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "jellyseerr":
		err = jellyseerrlib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "sonarr":
		err = sonarrlib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "radarr":
		err = radarrlib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "lidarr":
		err = lidarrlib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "readarr":
		err = readarrlib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	case "prowlarr":
		err = prowlarrlib.New("", "Test", req.URL, req.Secrets).TestConnection(ctx)
	default:
		apiReturn.Error(c, "unsupported integration kind: "+req.Kind)
		return
	}

	if err != nil {
		apiReturn.Error(c, err.Error())
		return
	}

	apiReturn.SuccessData(c, map[string]interface{}{
		"kind":   req.Kind,
		"status": "connected",
	})
}
