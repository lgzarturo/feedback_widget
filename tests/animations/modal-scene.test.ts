import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { resolveAnimationBackend } from "../../src/animations/capabilities";
import {
  ANIMATION_MODE_ATTR,
  createModalAnimationController,
} from "../../src/animations/modal-scene";
import { DEFAULT_WIDGET_CONFIG } from "../../src/config/parse";
import type { WidgetConfig } from "../../src/config/types";
import { mockWebGLAvailable, mockWebGLUnavailable, restoreGetContext } from "./helpers/webgl";

function configWith(overrides: Partial<WidgetConfig> = {}): WidgetConfig {
  return { ...DEFAULT_WIDGET_CONFIG, ...overrides };
}

function createDialog(): HTMLElement {
  const dialog = document.createElement("div");
  dialog.className = "fw-modal-dialog";
  dialog.style.width = "320px";
  dialog.style.height = "200px";
  document.body.appendChild(dialog);
  return dialog;
}

function createDialogInShadowRoot(): HTMLElement {
  const host = document.createElement("div");
  const shadow = host.attachShadow({ mode: "open" });
  const dialog = document.createElement("div");
  dialog.className = "fw-modal-dialog";
  dialog.style.width = "320px";
  dialog.style.height = "200px";
  shadow.appendChild(dialog);
  document.body.appendChild(host);
  return dialog;
}

describe("BC-009 createModalAnimationController", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    restoreGetContext();
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

  test("given_animation_off_when_playClose_then_clears_three_state", async () => {
    mockWebGLAvailable();
    const dialog = createDialog();
    const controller = createModalAnimationController(configWith({ animation: "off" }), dialog);

    await controller.playOpen();
    await controller.playClose();

    expect(dialog.querySelector(".fw-animation-canvas")).toBeNull();
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

  test("given_webgl_available_when_playOpen_then_uses_threejs_path", async () => {
    mockWebGLAvailable();
    const dialog = createDialog();
    const controller = createModalAnimationController(configWith({ animation: "on" }), dialog);

    await controller.playOpen();

    expect(dialog.getAttribute(ANIMATION_MODE_ATTR)).toBe("threejs");
    expect(dialog.querySelector(".fw-animation-canvas")).not.toBeNull();
    expect(dialog.classList.contains("fw-modal-enter")).toBe(true);

    controller.dispose();
  });

  test("given_threejs_open_when_playClose_then_disposes_scene_and_clears_canvas", async () => {
    mockWebGLAvailable();
    const dialog = createDialog();
    const controller = createModalAnimationController(configWith({ animation: "on" }), dialog);

    await controller.playOpen();
    await controller.playClose();

    expect(dialog.hasAttribute("data-fw-exit-played")).toBe(true);
    expect(dialog.querySelector(".fw-animation-canvas")).toBeNull();
    expect(dialog.getAttribute(ANIMATION_MODE_ATTR)).toBeNull();
    expect(dialog.classList.contains("fw-modal-enter")).toBe(false);
    expect(dialog.classList.contains("fw-modal-exit")).toBe(false);

    controller.dispose();
  });

  test("given_shadow_dom_dialog_when_playOpen_then_injects_styles_in_shadow_root", async () => {
    mockWebGLUnavailable();
    const dialog = createDialogInShadowRoot();
    const shadow = dialog.getRootNode() as ShadowRoot;
    const controller = createModalAnimationController(configWith({ animation: "on" }), dialog);

    await controller.playOpen();

    expect(shadow.querySelector("style[data-fw-modal-animation-styles]")).not.toBeNull();
    controller.dispose();
  });

  test("given_styles_already_present_when_playOpen_then_does_not_duplicate_style_tag", async () => {
    mockWebGLUnavailable();
    const dialog = createDialogInShadowRoot();
    const shadow = dialog.getRootNode() as ShadowRoot;
    const controller = createModalAnimationController(configWith({ animation: "on" }), dialog);

    await controller.playOpen();
    await controller.playOpen();

    const styleTags = shadow.querySelectorAll("style[data-fw-modal-animation-styles]");
    expect(styleTags.length).toBe(1);

    controller.dispose();
  });

  test("given_controller_disposed_when_inspected_then_clears_animation_classes", async () => {
    mockWebGLUnavailable();
    const dialog = createDialog();
    const controller = createModalAnimationController(configWith({ animation: "on" }), dialog);

    await controller.playOpen();
    controller.dispose();

    expect(dialog.classList.contains("fw-modal-enter")).toBe(false);
    expect(dialog.classList.contains("fw-modal-exit")).toBe(false);
    expect(dialog.style.transform).toBe("");
    expect(dialog.style.opacity).toBe("");
    expect(dialog.getAttribute(ANIMATION_MODE_ATTR)).toBeNull();
  });

  test("given_webgl_mocked_when_resolve_backend_then_prefers_threejs_path", () => {
    mockWebGLAvailable();
    expect(resolveAnimationBackend(configWith({ animation: "on" }))).toBe("threejs");
  });
});

describe("BC-015 createModalAnimationController overlay", () => {
  let originalRaf: typeof window.requestAnimationFrame;

  beforeEach(() => {
    document.body.innerHTML = "";
    originalRaf = window.requestAnimationFrame;
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRaf;
    restoreGetContext();
    document.body.innerHTML = "";
  });

  test("given_webgl_available_when_playOpen_then_injects_overlay_styles_in_shadow_root", async () => {
    mockWebGLAvailable();
    const dialog = createDialogInShadowRoot();
    const shadow = dialog.getRootNode() as ShadowRoot;
    const controller = createModalAnimationController(configWith({ animation: "on" }), dialog);

    await controller.playOpen();

    const style = shadow.querySelector("style[data-fw-modal-animation-styles]");
    expect(style).not.toBeNull();
    expect(style?.textContent).toContain(".fw-animation-canvas");
    expect(style?.textContent).toMatch(/position:\s*absolute/);
    expect(style?.textContent).toContain(".fw-modal-header");
    expect(style?.textContent).toContain(".fw-tabs-panels");
    expect(style?.textContent).toMatch(/z-index:\s*1/);

    controller.dispose();
  });

  test("given_webgl_available_when_playOpen_then_applies_css_enter_without_growing_dialog", async () => {
    mockWebGLAvailable();
    const dialog = createDialog();
    const filler = document.createElement("div");
    filler.textContent = "contenido";
    dialog.appendChild(filler);
    const heightBefore = dialog.getBoundingClientRect().height;

    const controller = createModalAnimationController(configWith({ animation: "on" }), dialog);
    await controller.playOpen();

    const canvas = dialog.querySelector(".fw-animation-canvas");
    expect(canvas).not.toBeNull();
    expect(dialog.classList.contains("fw-modal-enter")).toBe(true);
    expect(dialog.style.opacity).toBe("1");
    expect(dialog.style.transform).toBe("scale(1)");
    expect(dialog.getBoundingClientRect().height).toBe(heightBefore);

    controller.dispose();
  });

  test("given_threejs_open_when_waiting_past_open_ms_then_raf_keeps_scheduling", async () => {
    mockWebGLAvailable();
    let rafCount = 0;
    window.requestAnimationFrame = (cb: FrameRequestCallback) => {
      rafCount += 1;
      return originalRaf.call(window, cb);
    };

    const dialog = createDialog();
    const controller = createModalAnimationController(configWith({ animation: "on" }), dialog);

    await controller.playOpen();
    const countAtOpenEnd = rafCount;

    await new Promise((resolve) => {
      setTimeout(resolve, 80);
    });

    expect(rafCount).toBeGreaterThan(countAtOpenEnd);

    await controller.playClose();
    controller.dispose();
  });
});
