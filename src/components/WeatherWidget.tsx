import React, { useState, useEffect, useRef } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Loader2,
  MapPin,
} from 'lucide-react';
import { WeatherData } from '../types';
import { useConfig } from '../providers/ConfigProvider';
import { useTheme } from '../providers/ThemeProvider';
import { toSimplified } from '../utils/chinese';
import './WeatherWidget.css';

const getWeatherIcon = (code: number, isDarkMode: boolean) => {
  if (code === 0) return { icon: Sun, label: '晴朗', color: isDarkMode ? 'text-amber-300' : 'text-amber-500' };
  if ([1, 2, 3].includes(code)) return { icon: Cloud, label: '多云', color: isDarkMode ? 'text-blue-200' : 'text-blue-500' };
  if ([45, 48].includes(code)) return { icon: CloudFog, label: '雾', color: isDarkMode ? 'text-slate-200' : 'text-slate-500' };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { icon: CloudRain, label: '降雨', color: isDarkMode ? 'text-blue-300' : 'text-blue-600' };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { icon: CloudSnow, label: '降雪', color: isDarkMode ? 'text-cyan-100' : 'text-cyan-600' };
  if ([95, 96, 99].includes(code))
    return { icon: CloudLightning, label: '雷雨', color: isDarkMode ? 'text-purple-300' : 'text-purple-600' };
  return { icon: Sun, label: '晴', color: isDarkMode ? 'text-amber-300' : 'text-amber-500' };
};

interface Location {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

interface WeatherWidgetProps {
  appAreaOpacity?: number;
  appAreaBlur?: number;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ appAreaOpacity, appAreaBlur }) => {
  const { config } = useConfig();
  const { isDarkMode } = useTheme();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const normalizeCity = (value: string | null | undefined) => {
    const raw = (value ?? '').trim();
    if (!raw) return '本地';
    return toSimplified(raw);
  };

  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem('weather_locations');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentLocIndex, setCurrentLocIndex] = useState(0);

  const fetchWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,precipitation_probability,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;

      const [weatherRes, geoRes] = await Promise.all([
        fetch(url),
        fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh-CN`,
        ),
      ]);

      if (!weatherRes.ok) throw new Error('API Error');
      const data = await weatherRes.json();

      let city = '本地';
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        city = normalizeCity(geoData.locality || geoData.city || geoData.principalSubdivision || '本地');
      }

      if (locations.length > 0 && locations[currentLocIndex] && locations[currentLocIndex].id !== 'gps') {
        city = normalizeCity(locations[currentLocIndex].name);
      }

      const currentHour = new Date().getHours();
      const next24 = data.hourly.time.slice(currentHour, currentHour + 24).map((t: string, i: number) => ({
        time: t.split('T')[1].slice(0, 5),
        temp: Math.round(data.hourly.temperature_2m[currentHour + i]),
        code: data.hourly.weather_code[currentHour + i],
        pop: data.hourly.precipitation_probability[currentHour + i],
      }));

      return {
        city,
        current: {
          temp: Math.round(data.current.temperature_2m),
          code: data.current.weather_code,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          windDir: data.current.wind_direction_10m,
          pressure: Math.round(data.current.pressure_msl),
          uv: data.daily.uv_index_max[0] || 0,
          feelsLike: Math.round(data.current.apparent_temperature),
          visibility: data.hourly.visibility
            ? Math.round(data.hourly.visibility[currentHour] / 1000)
            : 10,
          isDay: data.current.is_day,
        },
        hourly: next24,
        daily: data.daily.time.slice(0, 7).map((t: string, i: number) => ({
          date: new Date(t).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
          code: data.daily.weather_code[i],
          max: Math.round(data.daily.temperature_2m_max[i]),
          min: Math.round(data.daily.temperature_2m_min[i]),
          sunrise: data.daily.sunrise[i].split('T')[1],
          sunset: data.daily.sunset[i].split('T')[1],
          precipitationProb: data.daily.precipitation_probability_max[i],
        })),
        indices: {
          sport: '适宜',
          travel: '适宜',
          fishing: '适宜',
          uvDesc: data.daily.uv_index_max[0] > 6 ? '强' : '弱',
        },
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleAddLocation = (loc: Location) => {
    const exists = locations.find(
      (l) =>
        l.id === loc.id ||
        (l.name === loc.name && Math.abs(l.lat - loc.lat) < 0.1 && Math.abs(l.lon - loc.lon) < 0.1),
    );
    if (!exists) {
      const newLocs = [...locations, loc];
      setLocations(newLocs);
      setCurrentLocIndex(newLocs.length - 1);
    } else {
      const idx = locations.findIndex(
        (l) =>
          l.id === loc.id ||
          (l.name === loc.name && Math.abs(l.lat - loc.lat) < 0.1 && Math.abs(l.lon - loc.lon) < 0.1),
      );
      if (idx !== -1) setCurrentLocIndex(idx);

      if (loc.id === 'gps' && idx !== -1) {
        const newLocs = [...locations];
        newLocs[idx] = loc;
        setLocations(newLocs);
      }
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          fetchWeather(p.coords.latitude, p.coords.longitude).then((data) => {
            if (data) {
              const newLoc = {
                id: 'gps',
                name: normalizeCity(data.city),
                lat: p.coords.latitude,
                lon: p.coords.longitude,
              };
              handleAddLocation(newLoc);
            }
          });
        },
        () => {
          const defaultLoc = { id: 'bj', name: '北京', lat: 39.9, lon: 116.4 };
          if (locations.length === 0) setLocations([defaultLoc]);
        },
        { timeout: 5000 },
      );
    } else {
      const defaultLoc = { id: 'bj', name: '北京', lat: 39.9, lon: 116.4 };
      if (locations.length === 0) setLocations([defaultLoc]);
    }
  };

  useEffect(() => {
    if (locations.length === 0) {
      handleLocateMe();
    }
  }, []);

  useEffect(() => {
    if (locations.length > 0) {
      localStorage.setItem('weather_locations', JSON.stringify(locations));
    }
  }, [locations]);

  useEffect(() => {
    if (locations.length > 0 && locations[currentLocIndex]) {
      const loc = locations[currentLocIndex];
      setLoading(true);
      fetchWeather(loc.lat, loc.lon).then((data) => {
        if (data) setWeather(data);
        setLoading(false);
      });
    }
  }, [currentLocIndex, locations]);

  const capsuleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const resolvedOpacity = Math.max(
      typeof appAreaOpacity === 'number' ? appAreaOpacity : config.appAreaOpacity ?? 0.8,
      0.25,
    );
    const resolvedBlur = Math.max(
      typeof appAreaBlur === 'number' ? appAreaBlur : config.appAreaBlur ?? 18,
      6,
    );

    if (capsuleRef.current) {
      capsuleRef.current.style.setProperty('--weather-opacity', String(resolvedOpacity));
      capsuleRef.current.style.setProperty('--weather-blur', `${resolvedBlur}px`);
    }
  }, [appAreaOpacity, appAreaBlur, config.appAreaOpacity, config.appAreaBlur]);

  const { icon: MainIcon, label, color } = weather
    ? getWeatherIcon(weather.current.code, isDarkMode)
    : { icon: Sun, label: '--', color: '' };

  const CapsuleView = () => (
    <div
      ref={capsuleRef}
      className="weather-capsule relative flex items-center gap-2 px-4 py-2 rounded-full cursor-default transition-all duration-300 group select-none border border-slate-200/80 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.12)] dark:border-white/20 dark:text-slate-100 dark:shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
    >
      {loading || !weather ? (
        <div
          className="flex items-center gap-2"
          style={{ color: isDarkMode ? '#cbd5e1' : '#0f172a' }}
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs font-medium">加载中...</span>
        </div>
      ) : (
        <>
          <MainIcon className={`w-5 h-5 ${color} filter drop-shadow-sm`} />
          <div
            className="flex items-baseline gap-1.5"
            style={{ color: isDarkMode ? '#f8fafc' : '#0f172a' }}
          >
            <span className="text-lg font-bold leading-none font-sans">{weather.current.temp}°</span>
            <span
              className="text-xs font-semibold"
              style={{ color: isDarkMode ? '#e2e8f0' : '#1e293b' }}
            >
              {label}
            </span>
          </div>
          <div className="w-px h-4 mx-1 hidden sm:block bg-slate-300/80 dark:bg-white/20" />
          <div
            className="flex items-center gap-1 text-xs hidden sm:flex"
            style={{ color: isDarkMode ? '#cbd5e1' : '#1e293b' }}
          >
            <MapPin className="w-3 h-3" />
            <span className="max-w-[88px] truncate font-semibold">{normalizeCity(weather.city)}</span>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="relative">
      <CapsuleView />
    </div>
  );
};

export default WeatherWidget;
