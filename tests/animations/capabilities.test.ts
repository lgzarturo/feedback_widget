import { afterEach, describe, expect, test } from "bun:test";
import {
  isWebGLAvailable,
  resolveAnimationBackend,
  shouldPlayAnimations,
} from "../../src/animations/capabilities";
import { DEFAULT_WIDGET_CONFIG } from "../../src/config/parse";
import type { WidgetConfig } from "../../src/config/types";
import {
  mockGetContextThrows,
  mockWebGLAvailable,
  mockWebGLUnavailable,
  restoreGetContext,
} from "./helpers/webgl";

function configWith(overrides: Partial<WidgetConfig> = {}): WidgetConfig {
  return { ...DEFAULT_WIDGET_CONFIG, ...overrides };
}

const originalMatchMedia = window.matchMedia;

describe("BC-009 shouldPlayAnimations", () => {
  afterEach(() => {
    restoreGetContext();
    window.matchMedia = originalMatchMedia;
  });

  test("given_animation_off_when_checked_then_returns_false", () => {
    expect(shouldPlayAnimations(configWith({ animation: "off" }))).toBe(false);
  });

  test("given_reduced_motion_preferred_when_checked_then_returns_false", () => {
    window.matchMedia = ((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    expect(shouldPlayAnimations(configWith({ animation: "on" }))).toBe(false);
  });

  test("given_animation_on_and_no_reduced_motion_when_checked_then_returns_true", () => {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    expect(shouldPlayAnimations(configWith({ animation: "on" }))).toBe(true);
  });
});

describe("BC-009 isWebGLAvailable", () => {
  afterEach(() => {
    restoreGetContext();
  });

  test("given_webgl_context_when_checked_then_returns_true", () => {
    mockWebGLAvailable();
    expect(isWebGLAvailable()).toBe(true);
  });

  test("given_no_webgl_context_when_checked_then_returns_false", () => {
    mockWebGLUnavailable();
    expect(isWebGLAvailable()).toBe(false);
  });

  test("given_getContext_throws_when_checked_then_returns_false", () => {
    mockGetContextThrows();
    expect(isWebGLAvailable()).toBe(false);
  });
});

describe("BC-009 resolveAnimationBackend", () => {
  afterEach(() => {
    restoreGetContext();
    window.matchMedia = originalMatchMedia;
  });

  test("given_animation_off_when_resolved_then_returns_none", () => {
    mockWebGLAvailable();
    expect(resolveAnimationBackend(configWith({ animation: "off" }))).toBe("none");
  });

  test("given_reduced_motion_when_resolved_then_returns_none", () => {
    window.matchMedia = ((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    mockWebGLAvailable();
    expect(resolveAnimationBackend(configWith({ animation: "on" }))).toBe("none");
  });

  test("given_no_webgl_when_resolved_then_returns_css", () => {
    mockWebGLUnavailable();
    expect(resolveAnimationBackend(configWith({ animation: "on" }))).toBe("css");
  });

  test("given_webgl_available_when_resolved_then_returns_threejs", () => {
    mockWebGLAvailable();
    expect(resolveAnimationBackend(configWith({ animation: "on" }))).toBe("threejs");
  });
});
