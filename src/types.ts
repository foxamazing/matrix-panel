

export interface DockerAppConfig {
  enabled: boolean;
  container: string;
  showControls?: boolean;
}

export interface AppItem {
  id: string;
  name: string;
  url: string;
  icon: string;
  docker?: DockerAppConfig;
}

export interface DockerContainerInfo {
  id: string;
  name: string;
  image: string;
  state: string;
  status: string;
  created: number;
  labels?: Record<string, string>;
  cpuPercent?: number;
  memUsage?: number;
  memLimit?: number;
  memPercent?: number;
}

export interface EmbyConfig {
  enabled: boolean;
  serverUrl: string;
  apiKey: string;
  userId: string;
  limit?: number;
  height?: number;
  speed?: number;
  refreshSeconds?: number;
}

export interface EmbyCoverItem {
  id: string;
  name: string;
  type?: string;
  imageUrl: string;
}

export interface AppGroup {
  id: string;
  name: string;
  apps: AppItem[];
}

export interface SearchEngine {
  id: string;
  name: string;
  url: string; // 必须包含 {q}
  icon: string; // URL 或 iconify 字符串
}

export interface SystemStats {
  cpu: number;
  ram: number;
  disk: number;
  disks?: Array<{
    mountpoint: string;
    total: number;
    used: number;
    free: number;
    usedPercent: number;
  }>;
  temp: number;
  gpu?: number; // Usage %
  gpuTemp?: number; // GPU temperature °C
  power?: number; // Total power W
  netUp?: number; // KB/s
  netDown?: number; // KB/s
}

export type WidgetType =
  | 'weather'
  | 'clock'
  | 'date'
  | 'system'
  | 'iframe'
  | 'notebook'
  | 'calendar'
  | 'mediaServer'
  | 'downloads';

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  data?: any;
}

export type StatCardId = 'cpu' | 'ram' | 'disk' | 'temp' | 'gpu' | 'gpuTemp' | 'netUp' | 'netDown' | 'power';

export type MusicSource =
  | 'netease'
  | 'tencent'
  | 'kuwo'
  | 'kugou'
  | 'migu'
  | 'spotify'
  | 'ytmusic'
  | 'apple'
  | 'tidal'
  | 'deezer'
  | 'qobuz'
  | 'joox'
  | 'ximalaya';

export interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  album?: string;
  url: string; // MP3 URL 或 流媒体 URL
  cover: string | null;
  lyrics?: string; // LRC 格式字符串
  duration?: number;
  source?: MusicSource;
  meta?: any; // 存储特定源的 ID (例如网易云的 pic_id)
}

export interface LyricStyles {
  fontSize: number; // px
  blur: number; // px
  showTranslation?: boolean;
}

export interface MusicConfig {
  enabled: boolean;
  autoplay: boolean;
  volume: number; // 0.0 到 1.0
  mode: 'loop' | 'shuffle' | 'single';
  quality: string; // '128' | '192' | '320' | '740' | '999'
  lyricStyles?: LyricStyles;
  playlist: MusicTrack[];
}

export type UserRole = 'admin' | 'guest';

export interface User {
  id: string;
  username: string;
  password?: string; // 在某些上下文中为了安全可选，但配置中需要
  name: string;
  avatar?: string | null;
  role: UserRole;
}

export interface AppConfig {
  siteTitle: string; // 网站标题 (同时用于浏览器标签页)
  siteLogo: string | null; // 网站 Logo (显示在时钟旁)
  siteFavicon: string | null; // 浏览器标签页图标
  language: 'zh' | 'en';

  // 多用户支持
  users: User[];

  // 遗留字段 (保留以兼容旧版迁移，逻辑中使用 users[])
  adminUsername?: string;
  adminPassword?: string;
  adminName?: string;
  adminAvatar?: string | null;

  // 锁屏设置
  lockBgImage?: string | null;
  lockBgVideo?: string | null;
  lockBgType?: 'image' | 'video';
  lockBgPosition?: { x: number; y: number; scale: number };
  lockBgBlur?: number;

  // 桌面设置
  desktopBgPosition?: { x: number; y: number; scale: number };
  mobileBgPosition?: { x: number; y: number; scale: number }; // Added for mobile specific layout

  isPixelMode: boolean;
  pixelRainbow?: boolean;
  clockTitlePixel?: boolean;
  clockTimePixel?: boolean;
  showDate: boolean;
  showSeconds: boolean;
  customFont?: string;
  themeColor?: string;
  bgType: 'image' | 'video';
  bgImage: string | null;
  bgVideo: string | null;
  bgOpacity: number;
  bgBlur: number;
  appAreaOpacity: number;
  appAreaBlur: number;
  isDarkMode: boolean;
  musicConfig: MusicConfig;
  emby?: EmbyConfig;
  searchEngineId: string;
  appGroups: AppGroup[];
  customEngines: SearchEngine[];
  statsCardOrder?: StatCardId[];
  hiddenStatsCards?: StatCardId[];

  // 显示控制
  uiStyle?: 'glass' | 'minimal' | 'brutal' | 'neumorphic' | 'cyberpunk';
  use12HourFormat?: boolean;
  autoDarkMode?: boolean;
  immersiveMode?: boolean;
  performanceMode?: boolean;
}

// --- 天气类型 ---

export interface WeatherData {
  current: {
    temp: number;
    code: number;
    humidity: number;
    windSpeed: number;
    windDir: number;
    pressure: number;
    uv: number;
    feelsLike: number;
    visibility: number;
    isDay: number;
  };
  daily: Array<{
    date: string; // ISO 或本地化字符串
    code: number;
    min: number;
    max: number;
    sunrise: string;
    sunset: string;
    precipitationProb: number;
  }>;
  hourly: Array<{
    time: string; // 小时字符串 "14:00"
    temp: number;
    code: number;
    pop: number; // 降水概率
  }>;
  city: string;
  indices: {
    sport: string;
    travel: string;
    fishing: string;
    uvDesc: string;
    moonPhase?: number;
  };
}
