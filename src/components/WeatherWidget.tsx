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
  X,
  Droplets,
  Wind,
  ThermometerSun,
  Eye,
  Sunset,
  Sunrise,
  Compass,
  Moon,
  Activity,
  Umbrella,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { WeatherData } from '../types';
import { toSimplified } from '../utils/chinese';

// Hooks
import { useConfig } from '../providers/ConfigProvider';

const getWeatherIcon = (code: number) => {
  if (code === 0) return { icon: Sun, label: '晴朗', color: 'text-amber-400' };
  if ([1, 2, 3].includes(code)) return { icon: Cloud, label: '多云', color: 'text-blue-100' };
  if ([45, 48].includes(code)) return { icon: CloudFog, label: '雾', color: 'text-[var(--text-secondary)]' };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return { icon: CloudRain, label: '降雨', color: 'text-blue-300' };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { icon: CloudSnow, label: '降雪', color: 'text-cyan-100' };
  if ([95, 96, 99].includes(code))
    return { icon: CloudLightning, label: '雷雨', color: 'text-theme' };
  return { icon: Sun, label: '晴', color: 'text-amber-400' };
};

interface Location {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

interface WeatherWidgetProps {
  // Global UI/UX Pro Max rules apply -> empty props
}

const getWindDirection = (deg: number) => {
  if (deg >= 337.5 || deg < 22.5) return '北风';
  if (deg >= 22.5 && deg < 67.5) return '东北风';
  if (deg >= 67.5 && deg < 112.5) return '东风';
  if (deg >= 112.5 && deg < 157.5) return '东南风';
  if (deg >= 157.5 && deg < 202.5) return '南风';
  if (deg >= 202.5 && deg < 247.5) return '西南风';
  if (deg >= 247.5 && deg < 292.5) return '西风';
  if (deg >= 292.5 && deg < 337.5) return '西北风';
  return '北风';
};

const getLunarPhase = (date: Date): number => {
  // Approximate moon phase calculation (0 to 1) 
  const lp = 2551443;
  const now = date.getTime() / 1000;
  const newMoon = 918758400; // Known new moon: 1999-01-17 00:00:00 UTC
  const phase = ((now - newMoon) % lp) / lp;
  return phase < 0 ? phase + 1 : phase;
};

const getMoonPhaseName = (phase: number) => {
  if (phase === 0 || phase === 1) return '新月';
  if (phase > 0 && phase < 0.25) return '蛾眉月';
  if (phase === 0.25) return '上弦月';
  if (phase > 0.25 && phase < 0.5) return '盈凸月';
  if (phase === 0.5) return '满月';
  if (phase > 0.5 && phase < 0.75) return '亏凸月';
  if (phase === 0.75) return '下弦月';
  if (phase > 0.75 && phase < 1) return '残月';
  return '新月';
};

const WeatherWidget: React.FC<WeatherWidgetProps> = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
          { headers: { 'Accept-Language': 'zh-CN,zh;q=0.9' } }
        ),
      ]);

      if (!weatherRes.ok) throw new Error('API Error');
      const data = await weatherRes.json();

      let city = '本地';
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const raw = geoData.address?.city
          || geoData.address?.town
          || geoData.address?.county
          || geoData.address?.suburb
          || geoData.address?.state
          || '本地';
        city = toSimplified(raw);
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
          sport: [95, 96, 99, 71, 73, 75, 77, 61, 63, 65].includes(data.current.weather_code) ? '不宜' : '适宜',
          travel: [95, 96, 99].includes(data.current.weather_code) ? '不宜' : '适宜',
          fishing: (data.current.temperature_2m < 5 || data.current.temperature_2m > 35) ? '不宜' : '适宜',
          uvDesc: data.daily.uv_index_max[0] > 6 ? '高' : (data.daily.uv_index_max[0] > 3 ? '中' : '低'),
          moonPhase: getLunarPhase(new Date()),
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

  // Persist currentLocIndex so LockScreen knows which city is active
  useEffect(() => {
    localStorage.setItem('weather_current_loc_index', String(currentLocIndex));
  }, [currentLocIndex]);

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
      onClick={() => {
        if (weather) setIsModalOpen(true);
      }}
      className="relative flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all duration-300 group select-none glass-panel"
    >
      {loading || !weather ? (
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs font-medium">Loading...</span>
        </div>
      ) : (
        <>
          <MainIcon className={`w-5 h-5 ${color} filter drop-shadow-sm`} />
          <div className="flex items-baseline gap-1.5 text-[var(--text-primary)]">
            <span className="text-lg font-bold leading-none font-sans">{weather.current.temp}°</span>
            <span className="text-xs font-medium opacity-100">{label}</span>
          </div>
          <div className="w-px h-4 bg-[var(--glass-border)] mx-1 hidden sm:block" />
          <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hidden sm:flex">
            <MapPin className="w-3 h-3" />
            <span className="max-w-[80px] truncate">{weather.city}</span>
          </div>
        </>
      )}
    </div>
  );

  // Helper for 7-day temp bar
  const minTemp7 = weather ? Math.min(...weather.daily.map(d => d.min)) : 0;
  const maxTemp7 = weather ? Math.max(...weather.daily.map(d => d.max)) : 100;

  const WeatherDetailModal = () => {
    if (!isModalOpen || !weather) return null;

    return createPortal(
      <div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-2xl overflow-hidden w-full h-full animate-fade-in p-4 md:p-8"
        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', margin: 0 }}
        onClick={() => setIsModalOpen(false)}
      >
        <div
          className="relative w-full max-w-6xl h-full flex flex-col gap-4"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center w-full px-2 shrink-0">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-md">
              {weather.city}
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-1.5 md:p-2 rounded-full bg-theme/10 hover:bg-theme/20 text-white transition-all backdrop-blur-md"
            >
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          {/* Main Grid: 3 Columns on Large Screens */}
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0">

            {/* Col 1: Current Hero & 24h (Span 4) */}
            <div className="md:col-span-4 flex flex-col gap-4 min-h-0">
              {/* Top Info (Current) */}
              <div className="glass-panel border-white/20 flex flex-col items-center justify-center flex-1 min-h-0 text-white relative overflow-hidden">
                <MainIcon className={`w-28 h-28 ${color} drop-shadow-lg mb-2`} />
                <div className="flex items-start">
                  <span className="text-7xl font-black tracking-tighter drop-shadow-xl font-sans leading-none">{weather.current.temp}</span>
                  <span className="text-4xl font-bold mt-2 opacity-80">°</span>
                </div>
                <div className="text-2xl font-bold mt-1 opacity-90 tracking-wide">{label}</div>
                <div className="text-sm font-medium opacity-70 mt-1">体感 {weather.current.feelsLike}°</div>
              </div>

              {/* 24 Hourly */}
              <div className="glass-panel border-white/20 flex flex-col shrink-0">
                <div className="text-xs font-bold opacity-60 text-white uppercase tracking-wider mb-2 shrink-0">24小时预报</div>
                <div className="flex-1 flex flex-row overflow-x-auto gap-4 items-center pb-1 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {weather.hourly.map((h, i) => {
                    const { icon: HIcon, color: hColor } = getWeatherIcon(h.code);
                    return (
                      <div key={i} className="flex flex-col items-center gap-2 shrink-0 h-full justify-center">
                        <div className="text-xs font-medium text-white opacity-80">{i === 0 ? '现在' : h.time}</div>
                        <HIcon className={`w-6 h-6 ${hColor} drop-shadow-md`} />
                        <div className="text-sm font-bold text-white">{h.temp}°</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Col 2: Metrics Bento (Span 5) */}
            <div className="md:col-span-5 grid grid-cols-2 grid-rows-3 gap-4 min-h-0 h-full">
              {/* Sunrise/Sunset */}
              <div className="glass-panel p-4 rounded-3xl bg-theme/5 border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 opacity-60 text-white text-xs font-bold uppercase tracking-wider">
                  <Sunrise className="w-3.5 h-3.5" /> 日出日落
                </div>
                <div className="w-full flex-1 flex flex-col justify-center gap-1">
                  <div className="flex items-end justify-between border-b border-white/10 pb-1">
                    <span className="text-xs text-white/70">日出</span>
                    <span className="text-lg font-bold text-white">{weather.daily[0].sunrise}</span>
                  </div>
                  <div className="flex items-end justify-between pt-1">
                    <span className="text-xs text-white/70">日落</span>
                    <span className="text-lg font-bold text-white">{weather.daily[0].sunset}</span>
                  </div>
                </div>
              </div>

              {/* Moon phase */}
              <div className="glass-panel p-4 rounded-3xl bg-theme/5 border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 opacity-60 text-white text-xs font-bold uppercase tracking-wider">
                  <Moon className="w-3.5 h-3.5" /> 月相
                </div>
                <div className="w-full flex-1 flex flex-col items-center justify-center">
                  <div className="text-3xl mb-1">
                    {(weather.indices?.moonPhase ?? 0) < 0.1 ? '🌑' :
                      (weather.indices?.moonPhase ?? 0) < 0.25 ? '🌒' :
                        (weather.indices?.moonPhase ?? 0) < 0.4 ? '🌓' :
                          (weather.indices?.moonPhase ?? 0) < 0.6 ? '🌕' :
                            (weather.indices?.moonPhase ?? 0) < 0.75 ? '🌖' :
                              (weather.indices?.moonPhase ?? 0) < 0.9 ? '🌗' :
                                (weather.indices?.moonPhase ?? 0) <= 1.0 ? '🌘' : '🌑'}
                  </div>
                  <div className="text-sm font-bold text-white tracking-widest mt-0.5">
                    {getMoonPhaseName(weather.indices?.moonPhase || 0)}
                  </div>
                </div>
              </div>

              {/* Wind */}
              <div className="glass-panel p-4 rounded-3xl bg-theme/5 border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 opacity-60 text-white text-xs font-bold uppercase tracking-wider">
                  <Wind className="w-3.5 h-3.5" /> 风向风速
                </div>
                <div className="w-full flex-1 flex flex-col justify-center items-center relative">
                  <Compass className="w-10 h-10 text-white/20 absolute" />
                  <div className="text-xl font-black text-white z-10">{weather.current.windSpeed}</div>
                  <div className="text-[10px] text-white/70 uppercase z-10 mt-0.5">km/h · {getWindDirection(weather.current.windDir)}</div>
                </div>
              </div>

              {/* Humidity */}
              <div className="glass-panel p-4 rounded-3xl bg-theme/5 border-white/10 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 opacity-60 text-white text-xs font-bold uppercase tracking-wider">
                  <Droplets className="w-3.5 h-3.5" /> 湿度
                </div>
                <div className="w-full flex-1 flex flex-col justify-center">
                  <div className="text-3xl font-black text-white">{weather.current.humidity}%</div>
                  <div className="text-[10px] text-white/70 mt-1 leading-tight">露点约 {Math.round(weather.current.temp - ((100 - weather.current.humidity) / 5))}°</div>
                </div>
              </div>

              {/* UV & Others (col-span-2) */}
              <div className="glass-panel p-4 rounded-3xl bg-white/10 dark:bg-black/20 border-white/20 flex flex-col justify-between col-span-2">
                <div className="flex items-center gap-1.5 opacity-60 text-white text-xs font-bold uppercase tracking-wider mb-1">
                  <Activity className="w-3.5 h-3.5" /> 综合指标
                </div>
                <div className="w-full flex-1 flex justify-between items-center text-white px-2">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-white/60 mb-1">紫外线</span>
                    <span className="text-lg font-black">{weather.current.uv}</span>
                    <span className="text-[10px] opacity-80">{weather.indices?.uvDesc}</span>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-white/60 mb-1">气压</span>
                    <span className="text-lg font-black">{weather.current.pressure}</span>
                    <span className="text-[10px] opacity-80">hPa</span>
                  </div>
                  <div className="w-px h-8 bg-white/10"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-white/60 mb-1">能见度</span>
                    <span className="text-lg font-black">{weather.current.visibility}</span>
                    <span className="text-[10px] opacity-80">km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Col 3: 7 Daily & Life (Span 3) */}
            <div className="md:col-span-3 flex flex-col gap-4 min-h-0 h-full">

              {/* 7 Daily Layout compressed to list */}
              <div className="glass-panel p-4 lg:p-5 rounded-3xl bg-white/10 dark:bg-black/20 border-white/20 flex flex-col flex-1 min-h-0">
                <div className="text-xs font-bold opacity-60 text-white uppercase tracking-wider flex items-center gap-1.5 mb-2 shrink-0">
                  <Umbrella className="w-3.5 h-3.5" /> 7日趋势
                </div>
                <div className="flex flex-col justify-between flex-1 min-h-0">
                  {weather.daily.map((d, i) => {
                    const { icon: DIcon, color: dColor } = getWeatherIcon(d.code);
                    const leftPercent = ((d.min - minTemp7) / (maxTemp7 - minTemp7)) * 100;
                    const widthPercent = ((d.max - d.min) / (maxTemp7 - minTemp7)) * 100;
                    return (
                      <div key={i} className="flex items-center py-1">
                        <div className="w-9 text-[10px] sm:text-xs font-bold text-white opacity-90">{i === 0 ? '今天' : d.date.split('/')[1] + '日'}</div>
                        <DIcon className={`w-4 h-4 ${dColor} shrink-0 drop-shadow-sm mx-2`} />
                        <div className="flex-1 flex items-center justify-between">
                          <div className="w-5 text-right text-[10px] font-bold text-white opacity-80">{d.min}</div>
                          <div className="flex-1 mx-2 h-1 rounded-full bg-black/20 overflow-hidden relative">
                            <div
                              className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-amber-400"
                              style={{ left: `${leftPercent}%`, width: `${Math.max(widthPercent, 5)}%` }}
                            />
                          </div>
                          <div className="w-5 text-left text-[10px] font-bold text-white">{d.max}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Life Indices (Sport / Travel / Fish) */}
              <div className="glass-panel p-3 rounded-3xl shrink-0 bg-white/10 dark:bg-black/20 border-white/20 flex justify-around items-center">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] opacity-60 text-white mb-0.5">运动</span>
                  <span className="text-xs font-bold text-white">{weather.indices?.sport.includes('宜') ? '🏃 适宜' : '🚫 不宜'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] opacity-60 text-white mb-0.5">出行</span>
                  <span className="text-xs font-bold text-white">{weather.indices?.travel.includes('宜') ? '🚗 适宜' : '🚫 不宜'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] opacity-60 text-white mb-0.5">垂钓</span>
                  <span className="text-xs font-bold text-white">{weather.indices?.fishing.includes('宜') ? '🎣 适宜' : '🚫 不宜'}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="relative">
      <CapsuleView />
      <WeatherDetailModal />
    </div>
  );
};

export default WeatherWidget;

