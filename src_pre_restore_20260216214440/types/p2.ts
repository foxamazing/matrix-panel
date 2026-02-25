export interface P2Config {
  enabled: boolean;
  serverUrl?: string;
  username?: string;
  password?: string;
}

export interface P2Torrent {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: string;
  downloadSpeed?: number;
  uploadSpeed?: number;
}

export interface P2Stats {
  active: number;
  paused: number;
  completed: number;
  total: number;
  uploadSpeed: number;
  downloadSpeed: number;
}
