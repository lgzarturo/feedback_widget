import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { DEFAULT_WIDGET_CONFIG } from "../../src/config/parse";
import { createThreeModuleMock } from "./helpers/three-mock";
import { mockWebGLAvailable, restoreGetContext } from "./helpers/webgl";

function createFieldWithWrapper(): HTMLElement {
  const wrapper = document.createElement("div");
  const field = document.createElement("input");
  field.style.width = "120px";
  field.style.height = "40px";
  wrapper.appendChild(field);
  document.body.appendChild(wrapper);
  return field;
}

describe("BC-009 playValidationErrorFx threejs fallback", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    mockWebGLAvailable();
    mock.module("three", () => createThreeModuleMock({ failRenderer: true }));
  });

  afterEach(() => {
    restoreGetContext();
    document.body.innerHTML = "";
    mock.module("three", () => createThreeModuleMock());
  });

  test("given_renderer_init_fails_when_played_then_falls_back_to_css_shake", async () => {
    const { playValidationErrorFx } = await import("../../src/animations/validation-fx");
    const field = createFieldWithWrapper();

    playValidationErrorFx({ ...DEFAULT_WIDGET_CONFIG, animation: "on" }, field);

    expect(field.classList.contains("fw-validation-shake")).toBe(true);
    expect(field.parentElement?.querySelector(".fw-validation-canvas")).not.toBeNull();
  });
});
