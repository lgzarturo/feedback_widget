import type { WidgetAnimation, WidgetConfig, WidgetPosition } from "./types";

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  apiKey: "",
  baseUrl: "https://api.appsutiles.dev",
  source: "",
  position: "bottom-right",
  primaryColor: "#2563eb",
  accentColor: "#1d4ed8",
  locale: "es",
  animation: "on",
  zIndex: 9999,
};

const VALID_POSITIONS = new Set<WidgetPosition>([
  "bottom-left",
  "bottom-right",
  "top-left",
  "top-right",
]);

const POSITION_ALIASES: Record<string, WidgetPosition> = {
  "left-bottom": "bottom-left",
  "right-bottom": "bottom-right",
};

const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function parsePosition(value: string | undefined): WidgetPosition {
  if (!value) {
    return DEFAULT_WIDGET_CONFIG.position;
  }

  const normalized = value.trim().toLowerCase();

  if (POSITION_ALIASES[normalized]) {
    return POSITION_ALIASES[normalized];
  }

  if (VALID_POSITIONS.has(normalized as WidgetPosition)) {
    return normalized as WidgetPosition;
  }

  return DEFAULT_WIDGET_CONFIG.position;
}

function parseColor(value: string | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  return HEX_COLOR_PATTERN.test(trimmed) ? trimmed : fallback;
}

function parseAnimation(value: string | undefined): WidgetAnimation {
  if (!value) {
    return DEFAULT_WIDGET_CONFIG.animation;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "on" || normalized === "off" ? normalized : DEFAULT_WIDGET_CONFIG.animation;
}

function parseZIndex(value: string | undefined): number {
  if (!value) {
    return DEFAULT_WIDGET_CONFIG.zIndex;
  }

  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_WIDGET_CONFIG.zIndex;
}

function parseBaseUrl(value: string | undefined): string {
  if (!value) {
    return DEFAULT_WIDGET_CONFIG.baseUrl;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_WIDGET_CONFIG.baseUrl;
}

function parseString(value: string | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  return value.trim();
}

export function parseFeedbackConfig(host: HTMLElement): WidgetConfig {
  const { dataset } = host;

  return {
    apiKey: parseString(dataset.apiKey, DEFAULT_WIDGET_CONFIG.apiKey),
    baseUrl: parseBaseUrl(dataset.baseUrl),
    source: parseString(dataset.source, DEFAULT_WIDGET_CONFIG.source),
    position: parsePosition(dataset.position),
    primaryColor: parseColor(dataset.primaryColor, DEFAULT_WIDGET_CONFIG.primaryColor),
    accentColor: parseColor(dataset.accentColor, DEFAULT_WIDGET_CONFIG.accentColor),
    locale: parseString(dataset.locale, DEFAULT_WIDGET_CONFIG.locale),
    animation: parseAnimation(dataset.animation),
    zIndex: parseZIndex(dataset.zIndex),
  };
}
