package integration

import (
	api "matrix-panel/api/api_v1/integration"
	"matrix-panel/api/api_v1/middleware"

	"github.com/gin-gonic/gin"
)

func Init(router *gin.RouterGroup) {
	integrationRouter := router.Group("integrations", middleware.LoginInterceptor)
	{
		// 集成配置管理API (CRUD)
		integrationRouter.POST("list", api.GetIntegrations)
		integrationRouter.POST("create", api.CreateIntegration)
		integrationRouter.POST("detail/:id", api.GetIntegration)
		integrationRouter.POST("update/:id", api.UpdateIntegration)
		integrationRouter.POST("delete/:id", api.DeleteIntegration)
		integrationRouter.POST("test", api.TestIntegration)

		// Dashdot
		integrationRouter.POST("dashdot/storage", api.GetDashdotStorage)
		integrationRouter.POST("dashdot/network", api.GetDashdotNetwork)
		integrationRouter.POST("dashdot/test", api.DashdotTestConnectionHandler)

		// iCalendar
		integrationRouter.POST("ical/events", api.GetICalEvents)
		integrationRouter.POST("ical/test", api.ICalTestConnectionHandler)

		// GitLab
		integrationRouter.POST("gitlab/projects", api.GetGitLabProjects)
		integrationRouter.POST("gitlab/pipelines", api.GetGitLabPipelines)
		integrationRouter.POST("gitlab/test", api.GitLabTestConnectionHandler)

		// Docker
		integrationRouter.POST("docker/containers", api.DockerContainersHandler)
		integrationRouter.POST("docker/control", api.DockerControlHandler)
		integrationRouter.POST("docker/test", api.DockerTestConnectionHandler)

		// Docker Hub
		integrationRouter.POST("dockerhub/repositories", api.GetDockerHubRepositories)
		integrationRouter.POST("dockerhub/test", api.DockerHubTestConnectionHandler)

		// Uptime Kuma
		integrationRouter.POST("uptimekuma/monitors", api.GetUptimeKumaMonitors)
		integrationRouter.POST("uptimekuma/test", api.UptimeKumaTestConnectionHandler)

		// Plex
		integrationRouter.POST("plex/sessions", api.PlexSessionsHandler)
		integrationRouter.POST("plex/recently-added", api.PlexRecentlyAddedHandler)
		integrationRouter.POST("plex/test", api.PlexTestConnectionHandler)

		// Weather
		integrationRouter.POST("weather/at-location", api.WeatherAtLocationHandler)

		// qBittorrent
		integrationRouter.POST("qbittorrent/torrents", api.QBittorrentTorrentsHandler)
		integrationRouter.POST("qbittorrent/status", api.QBittorrentStatusHandler)
		integrationRouter.POST("qbittorrent/control", api.QBittorrentControlHandler)
		integrationRouter.POST("qbittorrent/test", api.QBittorrentTestConnectionHandler)

		// AdGuard Home
		integrationRouter.POST("adguard/stats", api.AdGuardStatsHandler)
		integrationRouter.POST("adguard/control", api.AdGuardControlHandler)
		integrationRouter.POST("adguard/test", api.AdGuardTestConnectionHandler)

		// Pi-hole
		integrationRouter.POST("pihole/stats", api.PiHoleStatsHandler)
		integrationRouter.POST("pihole/control", api.PiHoleControlHandler)
		integrationRouter.POST("pihole/test", api.PiHoleTestConnectionHandler)

		// Aria2
		integrationRouter.POST("aria2/torrents", api.Aria2TorrentsHandler)
		integrationRouter.POST("aria2/status", api.Aria2StatusHandler)
		integrationRouter.POST("aria2/control", api.Aria2ControlHandler)
		integrationRouter.POST("aria2/test", api.Aria2TestConnectionHandler)

		// Jellyfin
		integrationRouter.POST("jellyfin/sessions", api.JellyfinSessionsHandler)
		integrationRouter.POST("jellyfin/recently-added", api.JellyfinRecentlyAddedHandler)
		integrationRouter.POST("jellyfin/test", api.JellyfinTestConnectionHandler)

		// Emby
		integrationRouter.POST("emby/sessions", api.EmbySessionsHandler)
		integrationRouter.POST("emby/recently-added", api.EmbyRecentlyAddedHandler)
		integrationRouter.POST("emby/test", api.EmbyTestConnectionHandler)

		// Overseerr
		integrationRouter.POST("overseerr/requests", api.OverseerrRequestsHandler)
		integrationRouter.POST("overseerr/stats", api.OverseerrStatsHandler)
		integrationRouter.POST("overseerr/test", api.OverseerrTestConnectionHandler)

		// Jellyseerr
		integrationRouter.POST("jellyseerr/requests", api.JellyseerrRequestsHandler)
		integrationRouter.POST("jellyseerr/test", api.JellyseerrTestConnectionHandler)

		// Sonarr
		integrationRouter.POST("sonarr/calendar", api.GetSonarrCalendar)
		integrationRouter.POST("sonarr/series", api.GetSonarrSeries)
		integrationRouter.POST("sonarr/queue", api.GetSonarrQueue)
		integrationRouter.POST("sonarr/search", api.SearchSonarrSeries)
		integrationRouter.POST("sonarr/test", api.SonarrTestConnectionHandler)

		// Radarr
		integrationRouter.POST("radarr/calendar", api.GetRadarrCalendar)
		integrationRouter.POST("radarr/movies", api.GetRadarrMovies)
		integrationRouter.POST("radarr/queue", api.GetRadarrQueue)
		integrationRouter.POST("radarr/test", api.RadarrTestConnectionHandler)

		// Lidarr
		integrationRouter.POST("lidarr/calendar", api.GetLidarrCalendar)
		integrationRouter.POST("lidarr/artists", api.GetLidarrArtists)
		integrationRouter.POST("lidarr/test", api.LidarrTestConnectionHandler)

		// Readarr
		integrationRouter.POST("readarr/books", api.GetReadarrBooks)
		integrationRouter.POST("readarr/test", api.ReadarrTestConnectionHandler)

		// Prowlarr
		integrationRouter.POST("prowlarr/indexers", api.GetProwlarrIndexers)
		integrationRouter.POST("prowlarr/stats", api.GetProwlarrStats)
		integrationRouter.POST("prowlarr/test", api.ProwlarrTestConnectionHandler)
	}
}
