import React, { useState, useEffect } from 'react';
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

const getWeatherIcon = (code: number) => {
  if (code === 0) return { icon: Sun, label: '晴朗', color: 'text-amber-400' };
  if ([1, 2, 3].includes(code)) return { icon: Cloud, label: '多云', color: 'text-blue-100' };
  if ([45, 48].includes(code)) return { icon: CloudFog, label: '雾', color: 'text-slate-200' };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { icon: CloudRain, label: '降雨', color: 'text-blue-300' };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { icon: CloudSnow, label: '降雪', color: 'text-cyan-100' };
  if ([95, 96, 99].includes(code))
    return { icon: CloudLightning, label: '雷雨', color: 'text-purple-300' };
  return { icon: Sun, label: '晴', color: 'text-amber-400' };
};

interface Location {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

interface WeatherWidgetProps {
  appAreaOpacity: number;
  appAreaBlur: number;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ appAreaOpacity, appAreaBlur }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`,
        ),
      ]);

      if (!weatherRes.ok) throw new Error('API Error');
      const data = await weatherRes.json();

      let city = '本地';
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        city = geoData.locality || geoData.city || geoData.principalSubdivision || '本地';
      }

      if (locations.length > 0 && locations[currentLocIndex] && locations[currentLocIndex].id !== 'gps') {
        city = locations[currentLocIndex].name;
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
                name: data.city,
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

  const { icon: MainIcon, label, color } = weather
    ? getWeatherIcon(weather.current.code)
    : { icon: Sun, label: '--', color: '' };

  const CapsuleView = () => (
    <div
      className="relative flex items-center gap-2 px-4 py-2 rounded-full cursor-default transition-all duration-300 shadow-lg group border border-white/20 select-none"
      style={{
        backgroundColor: `rgba(var(--glass-base, 255, 255, 255), ${Math.max(appAreaOpacity, 0.2)})`,
        backdropFilter: `blur(${appAreaBlur}px)`,
        WebkitBackdropFilter: `blur(${appAreaBlur}px)`,
      }}
    >
      {loading || !weather ? (
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs font-medium">Loading...</span>
        </div>
      ) : (
        <>
          <MainIcon className={`w-5 h-5 ${color} filter drop-shadow-sm`} />
          <div className="flex items-baseline gap-1.5 text-slate-700 dark:text-slate-100">
            <span className="text-lg font-bold leading-none font-sans">{weather.current.temp}°</span>
            <span className="text-xs font-medium opacity-80">{label}</span>
          </div>
          <div className="w-px h-4 bg-slate-400/30 mx-1 hidden sm:block" />
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-300 hidden sm:flex">
            <MapPin className="w-3 h-3" />
            <span className="max-w-[80px] truncate">{weather.city}</span>
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

