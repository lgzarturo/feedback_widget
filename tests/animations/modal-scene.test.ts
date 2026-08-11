import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { resolveAnimationBackend } from "../../src/animations/capabilities";
import {
  ANIMATION_MODE_ATTR,
  createModalAnimationController,
} from "../../src/animations/modal-scene";
import { DEFAULT_WIDGET_CONFIG } from "../../src/config/parse";
import type { WidgetConfig } from "../../src/config/types";

function configWith(overrides: Partial<WidgetConfig> = {}): WidgetConfig {
  return { ...DEFAULT_WIDGET_CONFIG, ...overrides };
}

function createDialog(): HTMLElement {
  const dialog = document.createElement("div");
  dialog.className = "fw-modal-dialog";
  document.body.appendChild(dialog);
  return dialog;
}

const originalGetContext = HTMLCanvasElement.prototype.getContext;

function mockWebGLAvailable(): void {
  HTMLCanvasElement.prototype.getContext = ((type: string) => {
    if (type === "webgl" || type === "experimental-webgl") {
      return {} as WebGLRenderingContext;
    }
    return originalGetContext.call(document.createElement("canvas"), type);
  }) as typeof HTMLCanvasElement.prototype.getContext;
}

function mockWebGLUnavailable(): void {
  HTMLCanvasElement.prototype.getContext = (() =>
    null) as typeof HTMLCanvasElement.prototype.getContext;
}

describe("BC-009 createModalAnimationController", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    document.body.innerHTML = "";
  });

  test("given_animation_on_when_playOpen_then_applies_enter_animation", async () => {
    mockWebGLUnavailable();
    const dialog = createDialog();
    const controller = createModalAnimationController(configWith({ animation: "on" }), dialog);

    await controller.playOpen();

    expect(dialog.classList.contains("fw-modal-enter")).toBe(true);
    controller.dispose();
  });

  test("given_animation_on_when_playClose_then_applies_exit_animation", async () => {
    mockWebGLUnavailable();
    const dialog = createDialog();
    const controller = createModalAnimationController(configWith({ animation: "on" }), dialog);

    await controller.playOpen();
    await controller.playClose();

    expect(dialog.hasAttribute("data-fw-exit-played")).toBe(true);
    controller.dispose();
  });

  test("given_animation_off_when_playOpen_then_no_animation_side_effects", async () => {
    mockWebGLAvailable();
    const dialog = createDialog();
    const controller = createModalAnimationController(configWith({ animation: "off" }), dialog);

    await controller.playOpen();
    await controller.playClose();

    expect(dialog.classList.contains("fw-modal-enter")).toBe(false);
    expect(dialog.classList.contains("fw-modal-exit")).toBe(false);
    expect(dialog.querySelector(".fw-animation-canvas")).toBeNull();
    expect(dialog.getAttribute(ANIMATION_MODE_ATTR)).toBeNull();
    controller.dispose();
  });

  test("given_no_webgl_when_playOpen_then_uses_css_fallback_without_console_error", async () => {
    mockWebGLUnavailable();
    const errors: unknown[] = [];
    const warnings: unknown[] = [];
    const errorSpy = console.error;
    const warnSpy = console.warn;
    console.error = (...args: unknown[]) => errors.push(args);
    console.warn = (...args: unknown[]) => warnings.push(args);

    const dialog = createDialog();
    const controller = createModalAnimationController(configWith({ animation: "on" }), dialog);

    await controller.playOpen();

    expect(dialog.getAttribute(ANIMATION_MODE_ATTR)).toBe("css");
    expect(errors).toHaveLength(0);
    expect(warnings).toHaveLength(0);

    console.error = errorSpy;
    console.warn = warnSpy;
    controller.dispose();
  });

  test("given_webgl_mocked_when_resolve_backend_then_prefers_threejs_path", () => {
    mockWebGLAvailable();
    expect(resolveAnimationBackend(configWith({ animation: "on" }))).toBe("threejs");
  });
});
