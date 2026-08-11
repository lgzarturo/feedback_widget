import { WebGLRenderer } from "three";
import type { WidgetConfig } from "../config/types";
import { isWebGLAvailable, shouldPlayAnimations } from "./capabilities";

export const VALIDATION_FX_MS = 200;

const SHAKE_CLASS = "fw-validation-shake";
const VALIDATION_CANVAS_CLASS = "fw-validation-canvas";

const VALIDATION_STYLES = `
  @keyframes fw-validation-shake-keyframes {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }

  .${SHAKE_CLASS} {
    animation: fw-validation-shake-keyframes ${VALIDATION_FX_MS}ms ease-in-out;
  }

  .${VALIDATION_CANVAS_CLASS} {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }
`.trim();

let stylesInjected = false;

function ensureValidationStyles(): void {
  if (stylesInjected || document.querySelector("style[data-fw-validation-fx]")) {
    stylesInjected = true;
    return;
  }

  const style = document.createElement("style");
  style.setAttribute("data-fw-validation-fx", "");
  style.textContent = VALIDATION_STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
}

function playCssShake(target: HTMLElement): void {
  ensureValidationStyles();
  target.classList.remove(SHAKE_CLASS);
  void target.offsetWidth;
  target.classList.add(SHAKE_CLASS);

  setTimeout(() => {
    target.classList.remove(SHAKE_CLASS);
  }, VALIDATION_FX_MS);
}

function playThreeJsFlash(target: HTMLElement): boolean {
  try {
    const wrapper = target.parentElement;
    if (!wrapper) {
      return false;
    }

    const previousPosition = wrapper.style.position;
    if (!previousPosition || previousPosition === "static") {
      wrapper.style.position = "relative";
    }

    const canvas = document.createElement("canvas");
    canvas.className = VALIDATION_CANVAS_CLASS;
    wrapper.appendChild(canvas);

    const width = target.clientWidth || 100;
    const height = target.clientHeight || 40;
    const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0xef4444, 0.2);
    renderer.clear();

    setTimeout(() => {
      renderer.dispose();
      canvas.remove();
      if (!previousPosition || previousPosition === "static") {
        wrapper.style.position = previousPosition;
      }
    }, VALIDATION_FX_MS);

    return true;
  } catch {
    return false;
  }
}

export function playValidationErrorFx(config: WidgetConfig, target: HTMLElement): void {
  if (!shouldPlayAnimations(config)) {
    return;
  }

  if (isWebGLAvailable() && playThreeJsFlash(target)) {
    playCssShake(target);
    return;
  }

  playCssShake(target);
}
