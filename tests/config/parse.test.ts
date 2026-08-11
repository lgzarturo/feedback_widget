import { describe, expect, test } from "bun:test";
import { DEFAULT_WIDGET_CONFIG, parseFeedbackConfig } from "../../src/config/parse";

function hostWith(attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("data-feedback", "");
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

describe("BC-003 parseFeedbackConfig", () => {
  test("given_minimal_host_when_parse_then_applies_all_defaults", () => {
    const config = parseFeedbackConfig(hostWith());

    expect(config).toEqual(DEFAULT_WIDGET_CONFIG);
  });

  test("given_complete_host_when_parse_then_reads_all_attributes", () => {
    const config = parseFeedbackConfig(
      hostWith({
        "data-api-key": "test-key-123",
        "data-base-url": "https://custom.api.example",
        "data-source": "my-app",
        "data-position": "top-left",
        "data-primary-color": "#ff0000",
        "data-accent-color": "#00ff00",
        "data-locale": "en",
        "data-animation": "off",
        "data-z-index": "5000",
      }),
    );

    expect(config).toEqual({
      apiKey: "test-key-123",
      baseUrl: "https://custom.api.example",
      source: "my-app",
      position: "top-left",
      primaryColor: "#ff0000",
      accentColor: "#00ff00",
      locale: "en",
      animation: "off",
      zIndex: 5000,
    });
  });

  test("given_missing_base_url_when_parse_then_defaults_to_api_appsutiles", () => {
    const config = parseFeedbackConfig(hostWith({ "data-api-key": "key" }));

    expect(config.baseUrl).toBe("https://api.appsutiles.dev");
  });

  test("given_canonical_positions_when_parse_then_returns_normalized_position", () => {
    const positions = ["bottom-left", "bottom-right", "top-left", "top-right"] as const;

    for (const position of positions) {
      const config = parseFeedbackConfig(hostWith({ "data-position": position }));
      expect(config.position).toBe(position);
    }
  });

  test("given_position_aliases_when_parse_then_normalizes_to_canonical", () => {
    expect(parseFeedbackConfig(hostWith({ "data-position": "left-bottom" })).position).toBe(
      "bottom-left",
    );
    expect(parseFeedbackConfig(hostWith({ "data-position": "right-bottom" })).position).toBe(
      "bottom-right",
    );
  });

  test("given_invalid_position_when_parse_then_uses_default_without_throw", () => {
    expect(() => {
      const config = parseFeedbackConfig(hostWith({ "data-position": "center" }));
      expect(config.position).toBe("bottom-right");
    }).not.toThrow();
  });

  test("given_invalid_colors_when_parse_then_uses_color_defaults_without_throw", () => {
    expect(() => {
      const config = parseFeedbackConfig(
        hostWith({
          "data-primary-color": "red",
          "data-accent-color": "not-a-color",
        }),
      );
      expect(config.primaryColor).toBe("#2563eb");
      expect(config.accentColor).toBe("#1d4ed8");
    }).not.toThrow();
  });

  test("given_invalid_animation_and_z_index_when_parse_then_uses_defaults", () => {
    expect(() => {
      const config = parseFeedbackConfig(
        hostWith({
          "data-animation": "maybe",
          "data-z-index": "abc",
        }),
      );
      expect(config.animation).toBe("on");
      expect(config.zIndex).toBe(9999);
    }).not.toThrow();
  });
});
