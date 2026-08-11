import {
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  TorusGeometry,
  WebGLRenderer,
} from "three";
import type { WidgetConfig } from "../config/types";
import { isWebGLAvailable, shouldPlayAnimations } from "./capabilities";

export const ANIMATION_MODE_ATTR = "data-fw-animation-mode";

export const MODAL_OPEN_MS = 300;
export const MODAL_CLOSE_MS = 150;

const MODAL_ENTER_CLASS = "fw-modal-enter";
const MODAL_EXIT_CLASS = "fw-modal-exit";
const CANVAS_CLASS = "fw-animation-canvas";

const MODAL_ANIMATION_STYLES = `
  .fw-modal-dialog {
    transition: transform ${MODAL_OPEN_MS}ms ease-out, opacity ${MODAL_OPEN_MS}ms ease-out;
  }

  .fw-modal-dialog.${MODAL_ENTER_CLASS} {
    transform: scale(1);
    opacity: 1;
  }

  .fw-modal-dialog.${MODAL_EXIT_CLASS} {
    transform: scale(0.95);
    opacity: 0;
  }

  .fw-animation-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }

  .fw-modal-dialog {
    position: relative;
    z-index: 1;
  }
`.trim();

export interface ModalAnimationController {
  playOpen(): Promise<void>;
  playClose(): Promise<void>;
  dispose(): void;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function ensureModalStyles(dialog: HTMLElement): void {
  const root = dialog.getRootNode();
  const container = root instanceof ShadowRoot ? root : document.head;
  const marker = "fw-modal-animation-styles";
  if (container.querySelector(`style[data-${marker}]`)) {
    return;
  }

  const style = document.createElement("style");
  style.setAttribute(`data-${marker}`, "");
  style.textContent = MODAL_ANIMATION_STYLES;
  container.appendChild(style);
}

function setAnimationMode(dialog: HTMLElement, mode: "threejs" | "css" | null): void {
  if (mode === null) {
    dialog.removeAttribute(ANIMATION_MODE_ATTR);
    return;
  }
  dialog.setAttribute(ANIMATION_MODE_ATTR, mode);
}

function removeCanvas(dialog: HTMLElement): void {
  const canvas = dialog.querySelector(`.${CANVAS_CLASS}`);
  canvas?.remove();
}

function playCssOpen(dialog: HTMLElement): Promise<void> {
  ensureModalStyles(dialog);
  setAnimationMode(dialog, "css");
  dialog.classList.remove(MODAL_EXIT_CLASS);
  dialog.style.transform = "scale(0.95)";
  dialog.style.opacity = "0";

  requestAnimationFrame(() => {
    dialog.classList.add(MODAL_ENTER_CLASS);
    dialog.style.transform = "scale(1)";
    dialog.style.opacity = "1";
  });

  return wait(MODAL_OPEN_MS);
}

function playCssClose(dialog: HTMLElement): Promise<void> {
  ensureModalStyles(dialog);
  setAnimationMode(dialog, "css");
  dialog.classList.remove(MODAL_ENTER_CLASS);
  dialog.classList.add(MODAL_EXIT_CLASS);
  dialog.style.transform = "scale(0.95)";
  dialog.style.opacity = "0";

  return wait(MODAL_CLOSE_MS).then(() => {
    dialog.setAttribute("data-fw-exit-played", "");
    dialog.classList.remove(MODAL_EXIT_CLASS);
    dialog.style.transform = "";
    dialog.style.opacity = "";
  });
}

interface ThreeSceneState {
  renderer: WebGLRenderer;
  rafId: number | null;
  canvas: HTMLCanvasElement;
}

function createThreeScene(dialog: HTMLElement): ThreeSceneState | null {
  try {
    const canvas = document.createElement("canvas");
    canvas.className = CANVAS_CLASS;
    dialog.prepend(canvas);

    const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(1);
    renderer.setSize(dialog.clientWidth || 320, dialog.clientHeight || 200);

    const scene = new Scene();
    const camera = new PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 3;

    const geometry = new TorusGeometry(0.4, 0.12, 8, 16);
    const material = new MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.35 });
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    let rafId: number | null = null;
    const start = performance.now();

    const animate = (now: number): void => {
      const elapsed = (now - start) / 1000;
      mesh.rotation.x = elapsed * 1.5;
      mesh.rotation.y = elapsed * 2;
      renderer.render(scene, camera);
      if (elapsed < MODAL_OPEN_MS / 1000) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);

    return { renderer, rafId, canvas };
  } catch {
    removeCanvas(dialog);
    return null;
  }
}

function disposeThreeScene(state: ThreeSceneState | null): void {
  if (!state) {
    return;
  }

  if (state.rafId !== null) {
    cancelAnimationFrame(state.rafId);
  }

  state.renderer.dispose();
  state.canvas.remove();
}

export function createModalAnimationController(
  config: WidgetConfig,
  dialog: HTMLElement,
): ModalAnimationController {
  let threeState: ThreeSceneState | null = null;
  let useThreeJs = false;

  async function playOpen(): Promise<void> {
    if (!shouldPlayAnimations(config)) {
      setAnimationMode(dialog, null);
      return;
    }

    removeCanvas(dialog);
    disposeThreeScene(threeState);
    threeState = null;

    if (isWebGLAvailable()) {
      threeState = createThreeScene(dialog);
      if (threeState) {
        useThreeJs = true;
        setAnimationMode(dialog, "threejs");
        dialog.classList.add(MODAL_ENTER_CLASS);
        await wait(MODAL_OPEN_MS);
        return;
      }
    }

    useThreeJs = false;
    await playCssOpen(dialog);
  }

  async function playClose(): Promise<void> {
    if (!shouldPlayAnimations(config)) {
      setAnimationMode(dialog, null);
      removeCanvas(dialog);
      disposeThreeScene(threeState);
      threeState = null;
      return;
    }

    if (useThreeJs && threeState) {
      setAnimationMode(dialog, "threejs");
      dialog.classList.add(MODAL_EXIT_CLASS);
      await wait(MODAL_CLOSE_MS);
      dialog.setAttribute("data-fw-exit-played", "");
      disposeThreeScene(threeState);
      threeState = null;
      removeCanvas(dialog);
      dialog.classList.remove(MODAL_ENTER_CLASS, MODAL_EXIT_CLASS);
      setAnimationMode(dialog, null);
      return;
    }

    await playCssClose(dialog);
    setAnimationMode(dialog, null);
  }

  function dispose(): void {
    disposeThreeScene(threeState);
    threeState = null;
    removeCanvas(dialog);
    dialog.classList.remove(MODAL_ENTER_CLASS, MODAL_EXIT_CLASS);
    dialog.style.transform = "";
    dialog.style.opacity = "";
    setAnimationMode(dialog, null);
  }

  return { playOpen, playClose, dispose };
}
