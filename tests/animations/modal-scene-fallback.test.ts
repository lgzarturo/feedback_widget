import { afterAll, afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { DEFAULT_WIDGET_CONFIG } from "../../src/config/parse";
import { createThreeModuleMock } from "./helpers/three-mock";
import { mockWebGLAvailable, restoreGetContext } from "./helpers/webgl";

describe("BC-009 createModalAnimationController threejs fallback", () => {
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

  afterAll(() => {
    mock.module("three", () => createThreeModuleMock());
  });

  test("given_renderer_init_fails_when_playOpen_then_falls_back_to_css", async () => {
    const { ANIMATION_MODE_ATTR, createModalAnimationController } = await import(
      "../../src/animations/modal-scene"
    );

    const dialog = document.createElement("div");
    dialog.className = "fw-modal-dialog";
    dialog.style.width = "320px";
    dialog.style.height = "200px";
    document.body.appendChild(dialog);

    const controller = createModalAnimationController(
      { ...DEFAULT_WIDGET_CONFIG, animation: "on" },
      dialog,
    );

    await controller.playOpen();

    expect(dialog.getAttribute(ANIMATION_MODE_ATTR)).toBe("css");
    expect(dialog.querySelector(".fw-animation-canvas")).toBeNull();
    expect(dialog.classList.contains("fw-modal-enter")).toBe(true);

    controller.dispose();
  });
});
