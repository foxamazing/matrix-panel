export interface Widget {
  id: string;
  type: string;
  title: string;
  icon?: string;
  data?: any;
  config?: any;
  position?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}
