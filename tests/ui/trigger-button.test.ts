import { afterEach, describe, expect, test } from "bun:test";
import { DEFAULT_WIDGET_CONFIG } from "../../src/config/parse";
import type { WidgetConfig, WidgetPosition } from "../../src/config/types";
import { createTriggerButton } from "../../src/ui/trigger-button";

function configWith(overrides: Partial<WidgetConfig> = {}): WidgetConfig {
  return { ...DEFAULT_WIDGET_CONFIG, ...overrides };
}

function resetDom(): void {
  document.body.innerHTML = "";
  for (const el of document.head.querySelectorAll("style[data-test-global]")) {
    el.remove();
  }
}

function getTriggerButton(host: HTMLElement): HTMLButtonElement {
  const button = host.shadowRoot?.querySelector("button");
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("Trigger button not found in shadow root");
  }
  return button;
}

describe("BC-005 createTriggerButton", () => {
  afterEach(() => {
    resetDom();
  });

  test("given_bottom_right_position_when_create_trigger_then_host_is_positioned_bottom_right", () => {
    const host = createTriggerButton(configWith({ position: "bottom-right" }));

    expect(host.style.position).toBe("fixed");
    expect(host.style.bottom).toBe("24px");
    expect(host.style.right).toBe("24px");
    expect(host.style.top).toBe("auto");
    expect(host.style.left).toBe("auto");
  });

  test("given_bottom_left_position_when_create_trigger_then_host_is_positioned_bottom_left", () => {
    const host = createTriggerButton(configWith({ position: "bottom-left" }));

    expect(host.style.bottom).toBe("24px");
    expect(host.style.left).toBe("24px");
    expect(host.style.right).toBe("auto");
    expect(host.style.top).toBe("auto");
  });

  test("given_top_left_position_when_create_trigger_then_host_is_positioned_top_left", () => {
    const host = createTriggerButton(configWith({ position: "top-left" }));

    expect(host.style.top).toBe("24px");
    expect(host.style.left).toBe("24px");
    expect(host.style.bottom).toBe("auto");
    expect(host.style.right).toBe("auto");
  });

  test("given_top_right_position_when_create_trigger_then_host_is_positioned_top_right", () => {
    const host = createTriggerButton(configWith({ position: "top-right" }));

    expect(host.style.top).toBe("24px");
    expect(host.style.right).toBe("24px");
    expect(host.style.bottom).toBe("auto");
    expect(host.style.left).toBe("auto");
  });

  test.each<WidgetPosition>(["bottom-left", "bottom-right", "top-left", "top-right"])(
    "given_position_%s_when_create_trigger_then_applies_configured_z_index",
    (position) => {
      const host = createTriggerButton(configWith({ position, zIndex: 12000 }));

      expect(host.style.zIndex).toBe("12000");
    },
  );

  test("given_custom_primary_color_when_create_trigger_then_shadow_styles_include_color", () => {
    const host = createTriggerButton(configWith({ primaryColor: "#ff5500" }));
    const styleText = host.shadowRoot?.querySelector("style")?.textContent ?? "";

    expect(styleText).toContain("#ff5500");
  });

  test("given_trigger_created_when_inspected_then_styles_live_inside_shadow_dom", () => {
    const host = createTriggerButton(configWith());

    expect(host.shadowRoot).not.toBeNull();
    expect(host.shadowRoot?.querySelector("style")).not.toBeNull();
    expect(document.head.querySelector("[data-feedback-widget-styles]")).toBeNull();
  });

  test("given_global_button_styles_when_create_trigger_then_encapsulation_preserves_primary_color", () => {
    const globalStyle = document.createElement("style");
    globalStyle.setAttribute("data-test-global", "");
    globalStyle.textContent = "button { background-color: rgb(255, 0, 0) !important; }";
    document.head.appendChild(globalStyle);

    const host = createTriggerButton(configWith({ primaryColor: "#00ff00" }));
    const styleText = host.shadowRoot?.querySelector("style")?.textContent ?? "";

    expect(styleText).toContain("#00ff00");
    expect(styleText).not.toContain("rgb(255, 0, 0)");
  });

  test("given_trigger_button_when_created_then_has_accessible_aria_label", () => {
    const host = createTriggerButton(configWith());
    const button = getTriggerButton(host);

    expect(button.getAttribute("aria-label")).toBe("Enviar feedback");
    expect(button.getAttribute("type")).toBe("button");
  });

  test("given_trigger_button_when_enter_pressed_then_invokes_on_activate", () => {
    let activated = false;
    const host = createTriggerButton(configWith(), () => {
      activated = true;
    });
    const button = getTriggerButton(host);

    button.focus();
    button.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));

    expect(activated).toBe(true);
  });

  test("given_trigger_button_when_space_pressed_then_invokes_on_activate", () => {
    let activated = false;
    const host = createTriggerButton(configWith(), () => {
      activated = true;
    });
    const button = getTriggerButton(host);

    button.focus();
    button.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));

    expect(activated).toBe(true);
  });

  test("given_trigger_button_when_clicked_then_invokes_on_activate", () => {
    let activated = false;
    const host = createTriggerButton(configWith(), () => {
      activated = true;
    });
    const button = getTriggerButton(host);

    button.click();

    expect(activated).toBe(true);
  });
});
