export type WidgetPosition = "bottom-left" | "bottom-right" | "top-left" | "top-right";

export type WidgetAnimation = "on" | "off";

export interface WidgetConfig {
  apiKey: string;
  baseUrl: string;
  source: string;
  position: WidgetPosition;
  primaryColor: string;
  accentColor: string;
  locale: string;
  animation: WidgetAnimation;
  zIndex: number;
}
