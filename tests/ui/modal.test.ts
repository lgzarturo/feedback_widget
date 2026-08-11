import { afterEach, describe, expect, test } from "bun:test";
import { DEFAULT_WIDGET_CONFIG } from "../../src/config/parse";
import type { WidgetConfig } from "../../src/config/types";
import { createFeedbackModal } from "../../src/ui/modal";
import { createTriggerButton } from "../../src/ui/trigger-button";

function configWith(overrides: Partial<WidgetConfig> = {}): WidgetConfig {
  return { ...DEFAULT_WIDGET_CONFIG, ...overrides };
}

function resetDom(): void {
  document.body.innerHTML = "";
}

function getTriggerButton(host: HTMLElement): HTMLButtonElement {
  const button = host.shadowRoot?.querySelector("button");
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("Trigger button not found in shadow root");
  }
  return button;
}

function getModalOverlay(modalHost: HTMLElement): HTMLElement {
  const overlay = modalHost.shadowRoot?.querySelector(".fw-modal-overlay");
  if (!(overlay instanceof HTMLElement)) {
    throw new Error("Modal overlay not found in shadow root");
  }
  return overlay;
}

function getCloseButton(modalHost: HTMLElement): HTMLButtonElement {
  const button = modalHost.shadowRoot?.querySelector(".fw-modal-close");
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("Close button not found in shadow root");
  }
  return button;
}

function getDialog(modalHost: HTMLElement): HTMLElement {
  const dialog = modalHost.shadowRoot?.querySelector('[role="dialog"]');
  if (!(dialog instanceof HTMLElement)) {
    throw new Error("Dialog not found in shadow root");
  }
  return dialog;
}

function getFocusableElements(modalHost: HTMLElement): HTMLElement[] {
  const dialog = getDialog(modalHost);
  const selector = "button, [href], input, select, textarea, [tabindex]";
  return [...dialog.querySelectorAll(selector)].filter((el): el is HTMLElement => {
    if (!(el instanceof HTMLElement) || el.hidden || el.hasAttribute("disabled")) {
      return false;
    }
    return el.tabIndex >= 0;
  });
}

describe("BC-006 createFeedbackModal", () => {
  afterEach(() => {
    resetDom();
  });

  test("given_modal_closed_when_open_called_then_dialog_is_visible", () => {
    const modal = createFeedbackModal(configWith());
    document.body.appendChild(modal.host);

    modal.open();

    expect(modal.isOpen()).toBe(true);
    const overlay = getModalOverlay(modal.host);
    expect(overlay.hidden).toBe(false);
    expect(getDialog(modal.host).getAttribute("aria-modal")).toBe("true");
  });

  test("given_modal_open_when_close_clicked_then_modal_closes", () => {
    const modal = createFeedbackModal(configWith());
    document.body.appendChild(modal.host);
    modal.open();

    getCloseButton(modal.host).click();

    expect(modal.isOpen()).toBe(false);
    expect(getModalOverlay(modal.host).hidden).toBe(true);
  });

  test("given_modal_open_when_escape_pressed_then_modal_closes", () => {
    const modal = createFeedbackModal(configWith());
    document.body.appendChild(modal.host);
    modal.open();

    getDialog(modal.host).dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );

    expect(modal.isOpen()).toBe(false);
  });

  test("given_trigger_wired_to_modal_when_button_clicked_then_modal_opens", () => {
    const modal = createFeedbackModal(configWith());
    const trigger = createTriggerButton(configWith(), () => modal.open());
    document.body.append(trigger, modal.host);

    getTriggerButton(trigger).click();

    expect(modal.isOpen()).toBe(true);
  });

  test("given_modal_open_when_tab_pressed_at_last_focusable_then_focus_wraps_to_first", () => {
    const modal = createFeedbackModal(configWith());
    document.body.appendChild(modal.host);
    modal.open();

    const focusable = getFocusableElements(modal.host);
    expect(focusable.length).toBeGreaterThan(1);

    const last = focusable[focusable.length - 1];
    const first = focusable[0];
    last.focus();

    getDialog(modal.host).dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
    );

    expect(modal.host.shadowRoot?.activeElement).toBe(first);
  });

  test("given_modal_closed_after_open_when_reopened_then_restores_default_tab", () => {
    const modal = createFeedbackModal(configWith());
    document.body.appendChild(modal.host);

    modal.open();
    const contactTab = modal.host.shadowRoot?.querySelector('[role="tab"][aria-selected="true"]');
    const tabs = modal.host.shadowRoot?.querySelector('[role="tablist"]');
    const contactButton = tabs?.querySelectorAll('[role="tab"]')[1];
    if (contactButton instanceof HTMLElement) {
      contactButton.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    }

    modal.close();
    modal.open();

    const activeTab = modal.host.shadowRoot?.querySelector('[role="tab"][aria-selected="true"]');
    expect(activeTab?.textContent).toBe("Feedback");
    expect(contactTab).toBeDefined();
  });
});
