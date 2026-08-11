import type { WidgetConfig } from "../config/types";

export function shouldPlayAnimations(config: WidgetConfig): boolean {
  if (config.animation === "off") {
    return false;
  }

  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return false;
    }
  }

  return true;
}

export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl");
    return context !== null;
  } catch {
    return false;
  }
}

export type AnimationBackend = "threejs" | "css" | "none";

export function resolveAnimationBackend(config: WidgetConfig): AnimationBackend {
  if (!shouldPlayAnimations(config)) {
    return "none";
  }
  if (isWebGLAvailable()) {
    return "threejs";
  }
  return "css";
}
