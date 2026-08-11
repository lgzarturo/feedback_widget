import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { playValidationErrorFx } from "../../src/animations/validation-fx";
import { DEFAULT_WIDGET_CONFIG } from "../../src/config/parse";
import type { WidgetConfig } from "../../src/config/types";

function configWith(overrides: Partial<WidgetConfig> = {}): WidgetConfig {
  return { ...DEFAULT_WIDGET_CONFIG, ...overrides };
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

describe("BC-009 playValidationErrorFx", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    document.body.innerHTML = "";
  });

  test("given_invalid_field_when_playValidationFx_then_adds_shake_class", () => {
    mockWebGLUnavailable();
    const field = document.createElement("input");
    document.body.appendChild(field);

    playValidationErrorFx(configWith({ animation: "on" }), field);

    expect(field.classList.contains("fw-validation-shake")).toBe(true);
  });

  test("given_animation_off_when_playValidationFx_then_no_effect", () => {
    const field = document.createElement("input");
    document.body.appendChild(field);

    playValidationErrorFx(configWith({ animation: "off" }), field);

    expect(field.classList.contains("fw-validation-shake")).toBe(false);
    expect(field.querySelector(".fw-validation-canvas")).toBeNull();
  });

  test("given_no_webgl_when_playValidationFx_then_css_shake_only", () => {
    mockWebGLUnavailable();
    const errors: unknown[] = [];
    const errorSpy = console.error;
    console.error = (...args: unknown[]) => errors.push(args);

    const field = document.createElement("input");
    document.body.appendChild(field);

    playValidationErrorFx(configWith({ animation: "on" }), field);

    expect(field.classList.contains("fw-validation-shake")).toBe(true);
    expect(field.querySelector(".fw-validation-canvas")).toBeNull();
    expect(errors).toHaveLength(0);

    console.error = errorSpy;
  });
});
