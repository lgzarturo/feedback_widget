import type { WidgetConfig, WidgetPosition } from "../config/types";

export const POSITION_OFFSET = "24px";

export interface PositionStyles {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

const POSITION_STYLE_MAP: Record<WidgetPosition, PositionStyles> = {
  "bottom-right": {
    top: "auto",
    right: POSITION_OFFSET,
    bottom: POSITION_OFFSET,
    left: "auto",
  },
  "bottom-left": {
    top: "auto",
    right: "auto",
    bottom: POSITION_OFFSET,
    left: POSITION_OFFSET,
  },
  "top-right": {
    top: POSITION_OFFSET,
    right: POSITION_OFFSET,
    bottom: "auto",
    left: "auto",
  },
  "top-left": {
    top: POSITION_OFFSET,
    right: "auto",
    bottom: "auto",
    left: POSITION_OFFSET,
  },
};

export function getPositionStyles(position: WidgetPosition): PositionStyles {
  return POSITION_STYLE_MAP[position];
}

export function applyHostPosition(host: HTMLElement, config: WidgetConfig): void {
  const positionStyles = getPositionStyles(config.position);

  host.style.position = "fixed";
  host.style.top = positionStyles.top;
  host.style.right = positionStyles.right;
  host.style.bottom = positionStyles.bottom;
  host.style.left = positionStyles.left;
  host.style.zIndex = String(config.zIndex);
}

export function buildTriggerButtonStyles(config: WidgetConfig): string {
  return `
    .fw-trigger {
      appearance: none;
      border: none;
      border-radius: 9999px;
      width: 56px;
      height: 56px;
      cursor: pointer;
      background-color: ${config.primaryColor};
      color: #ffffff;
      font-size: 24px;
      line-height: 1;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .fw-trigger:focus-visible {
      outline: 2px solid #ffffff;
      outline-offset: 2px;
    }
  `.trim();
}
