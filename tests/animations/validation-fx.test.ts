import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { playValidationErrorFx } from "../../src/animations/validation-fx";
import { DEFAULT_WIDGET_CONFIG } from "../../src/config/parse";
import type { WidgetConfig } from "../../src/config/types";
import { mockWebGLAvailable, mockWebGLUnavailable, restoreGetContext } from "./helpers/webgl";

function configWith(overrides: Partial<WidgetConfig> = {}): WidgetConfig {
  return { ...DEFAULT_WIDGET_CONFIG, ...overrides };
}

function createFieldWithWrapper(position = ""): HTMLElement {
  const wrapper = document.createElement("div");
  if (position) {
    wrapper.style.position = position;
  }
  const field = document.createElement("input");
  field.style.width = "120px";
  field.style.height = "40px";
  wrapper.appendChild(field);
  document.body.appendChild(wrapper);
  return field;
}

describe("BC-009 playValidationErrorFx", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    restoreGetContext();
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

  test("given_webgl_available_when_playValidationFx_then_adds_flash_canvas_and_shake", () => {
    mockWebGLAvailable();
    const field = createFieldWithWrapper();

    playValidationErrorFx(configWith({ animation: "on" }), field);

    expect(field.classList.contains("fw-validation-shake")).toBe(true);
    expect(field.parentElement?.querySelector(".fw-validation-canvas")).not.toBeNull();
  });

  test("given_field_without_parent_when_playValidationFx_then_css_shake_only", () => {
    mockWebGLAvailable();
    const field = document.createElement("input");

    playValidationErrorFx(configWith({ animation: "on" }), field);

    expect(field.classList.contains("fw-validation-shake")).toBe(true);
    expect(field.parentElement).toBeNull();
    expect(document.querySelector(".fw-validation-canvas")).toBeNull();
  });

  test("given_static_wrapper_position_when_playValidationFx_then_restores_position", async () => {
    mockWebGLAvailable();
    const field = createFieldWithWrapper("static");
    const wrapper = field.parentElement;
    expect(wrapper).not.toBeNull();

    playValidationErrorFx(configWith({ animation: "on" }), field);

    expect(wrapper?.style.position).toBe("relative");
    expect(field.parentElement?.querySelector(".fw-validation-canvas")).not.toBeNull();

    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(wrapper?.style.position).toBe("static");
    expect(wrapper?.querySelector(".fw-validation-canvas")).toBeNull();
  });

  test("given_validation_styles_already_injected_when_played_twice_then_shake_still_applies", () => {
    mockWebGLUnavailable();
    const field = document.createElement("input");
    document.body.appendChild(field);

    playValidationErrorFx(configWith({ animation: "on" }), field);
    playValidationErrorFx(configWith({ animation: "on" }), field);

    expect(field.classList.contains("fw-validation-shake")).toBe(true);
  });
});
