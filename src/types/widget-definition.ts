export interface WidgetDefinition {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  defaultConfig?: any;
  configurable?: boolean;
}
