package integration

import (
	"strconv"

	"matrix-panel/api/api_v1/common/apiReturn"
	"matrix-panel/lib/integration/weather"

	"github.com/gin-gonic/gin"
)

// WeatherAtLocationHandler gets weather data by coordinates.
// Supports JSON body for POST and query fallback for compatibility.
func WeatherAtLocationHandler(c *gin.Context) {
	var (
		lat  float64
		long float64
	)

	var req struct {
		Latitude  *float64 `json:"latitude"`
		Longitude *float64 `json:"longitude"`
	}

	if err := c.ShouldBindJSON(&req); err == nil && req.Latitude != nil && req.Longitude != nil {
		lat = *req.Latitude
		long = *req.Longitude
	} else {
		latStr := c.Query("latitude")
		longStr := c.Query("longitude")
		if latStr == "" || longStr == "" {
			apiReturn.ErrorParamFomat(c, "latitude and longitude are required")
			return
		}

		parsedLat, parseErr := strconv.ParseFloat(latStr, 64)
		if parseErr != nil {
			apiReturn.ErrorParamFomat(c, "invalid latitude")
			return
		}

		parsedLong, parseErr := strconv.ParseFloat(longStr, 64)
		if parseErr != nil {
			apiReturn.ErrorParamFomat(c, "invalid longitude")
			return
		}

		lat = parsedLat
		long = parsedLong
	}

	data, err := weather.GetWeather(lat, long)
	if err != nil {
		apiReturn.Error(c, err.Error())
		return
	}

	apiReturn.SuccessData(c, data)
}
