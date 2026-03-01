import React, { useEffect, useState } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Moon,
  Sun,
  Wind,
  Droplets,
} from "lucide-react";
import { cn } from "../../lib/utils";

const getWeatherIcon = (code: number, isNight: boolean = false) => {
  if (code === 0) return isNight ? Moon : Sun;
  if (code >= 1 && code <= 3) return Cloud;
  if (code >= 45 && code <= 48) return CloudFog;
  if (code >= 51 && code <= 55) return CloudDrizzle;
  if (code >= 56 && code <= 57) return CloudDrizzle;
  if (code >= 61 && code <= 67) return CloudRain;
  if (code >= 71 && code <= 77) return CloudSnow;
  if (code >= 80 && code <= 82) return CloudRain;
  if (code >= 85 && code <= 86) return CloudSnow;
  if (code >= 95 && code <= 99) return CloudLightning;
  return Sun;
};

const getWeatherDescription = (code: number) => {
  const codes: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    95: "Thunderstorm",
  };
  return codes[code] || "Unknown";
};

export interface WeatherWidgetOptions {
  latitude?: number;
  longitude?: number;
  city?: string;
  units?: "metric" | "imperial";
  showWind?: boolean;
  showHumidity?: boolean;
}

interface WeatherWidgetProps {
  options?: WeatherWidgetOptions;
  className?: string;
}

export default function WeatherWidget({ options = {}, className }: WeatherWidgetProps) {
  const {
    latitude = 51.5074,
    longitude = -0.1278,
    city = "London",
    units = "metric",
    showWind = true,
    showHumidity = true,
  } = options;

  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,is_day`
        );
        if (!res.ok) throw new Error("Failed to fetch weather");
        const data = await res.json();
        setWeather(data.current);
      } catch {
        setError("Error loading weather");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 1000 * 60 * 15);
    return () => clearInterval(interval);
  }, [latitude, longitude]);

  if (loading) return <div className="flex items-center justify-center h-full text-sm opacity-50">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-full text-sm text-red-400">{error}</div>;
  if (!weather) return null;

  const Icon = getWeatherIcon(weather.weather_code, weather.is_day === 0);
  const description = getWeatherDescription(weather.weather_code);
  const temperature = units === "imperial" ? weather.temperature_2m * 9 / 5 + 32 : weather.temperature_2m;
  const windSpeed = units === "imperial" ? weather.wind_speed_10m * 0.621371 : weather.wind_speed_10m;
  const tempUnit = units === "imperial" ? "F" : "C";
  const windUnit = units === "imperial" ? "mph" : "km/h";

  return (
    <div className={cn("flex flex-col items-center justify-center h-full w-full gap-2 p-4", className)}>
      <div className="flex items-center gap-2">
        <Icon className="w-10 h-10 text-yellow-500" />
        <div className="flex flex-col">
          <span className="text-3xl font-bold tabular-nums">
            {Math.round(temperature)}°{tempUnit}
          </span>
          <span className="text-xs opacity-70">{city}</span>
        </div>
      </div>

      <div className="text-sm font-medium opacity-90">{description}</div>

      <div className="flex gap-4 mt-1 text-xs opacity-70">
        {showWind && (
          <div className="flex items-center gap-1">
            <Wind className="w-3 h-3" />
            <span>{Math.round(windSpeed)} {windUnit}</span>
          </div>
        )}
        {showHumidity && (
          <div className="flex items-center gap-1">
            <Droplets className="w-3 h-3" />
            <span>{weather.relative_humidity_2m}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
