import { afterEach, describe, expect, test } from "bun:test";
import { bootstrapFeedbackWidget, initFeedbackWidget } from "../src/bootstrap";
import { DEFAULT_WIDGET_CONFIG } from "../src/config/parse";

function hostWith(attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("data-feedback", "");
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

function resetDom(): void {
  document.body.innerHTML = "";
}

describe("BC-004 bootstrapFeedbackWidget", () => {
  afterEach(() => {
    resetDom();
  });

  test("given_host_with_data_feedback_when_domcontentloaded_then_auto_initializes", () => {
    const host = hostWith({ "data-api-key": "test-key" });
    document.body.appendChild(host);

    bootstrapFeedbackWidget();
    document.dispatchEvent(new Event("DOMContentLoaded"));

    expect(host.hasAttribute("data-feedback-initialized")).toBe(true);
    const instance = initFeedbackWidget(host);
    expect(instance.config.apiKey).toBe("test-key");
  });

  test("given_document_already_loaded_when_bootstrap_then_initializes_immediately", () => {
    const host = hostWith();
    document.body.appendChild(host);

    bootstrapFeedbackWidget();

    expect(host.hasAttribute("data-feedback-initialized")).toBe(true);
  });

  test("given_no_hosts_when_domcontentloaded_then_does_nothing_without_throw", () => {
    expect(() => {
      bootstrapFeedbackWidget();
      document.dispatchEvent(new Event("DOMContentLoaded"));
    }).not.toThrow();
  });
});

describe("BC-004 initFeedbackWidget", () => {
  afterEach(() => {
    resetDom();
  });

  test("given_host_element_when_init_called_manually_then_returns_instance_with_config", () => {
    const host = hostWith({ "data-position": "top-left" });
    document.body.appendChild(host);

    const instance = initFeedbackWidget(host);

    expect(instance.host).toBe(host);
    expect(instance.config.position).toBe("top-left");
    expect(host.hasAttribute("data-feedback-initialized")).toBe(true);
  });

  test("given_minimal_host_when_init_called_manually_then_applies_default_config", () => {
    const host = hostWith();
    document.body.appendChild(host);

    const instance = initFeedbackWidget(host);

    expect(instance.config).toEqual(DEFAULT_WIDGET_CONFIG);
  });

  test("given_already_initialized_host_when_init_called_again_then_returns_same_instance", () => {
    const host = hostWith();
    document.body.appendChild(host);

    const first = initFeedbackWidget(host);
    const second = initFeedbackWidget(host);

    expect(second).toBe(first);
    expect(host.querySelectorAll("[data-feedback-initialized]").length).toBe(0);
  });

  test("given_two_hosts_when_init_each_then_creates_independent_instances", () => {
    const hostA = hostWith({ "data-api-key": "key-a" });
    const hostB = hostWith({ "data-api-key": "key-b" });
    document.body.append(hostA, hostB);

    const instanceA = initFeedbackWidget(hostA);
    const instanceB = initFeedbackWidget(hostB);

    expect(instanceA).not.toBe(instanceB);
    expect(instanceA.config.apiKey).toBe("key-a");
    expect(instanceB.config.apiKey).toBe("key-b");
  });
});

function getTriggerButton(triggerHost: HTMLElement): HTMLButtonElement {
  const button = triggerHost.shadowRoot?.querySelector("button");
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

describe("BC-011 bootstrap widget mount", () => {
  afterEach(() => {
    resetDom();
  });

  test("given_host_when_init_then_trigger_button_appended_to_body", () => {
    const host = hostWith();
    document.body.appendChild(host);

    const instance = initFeedbackWidget(host);

    expect(instance.trigger).toBeDefined();
    const trigger = instance.trigger as HTMLElement;
    expect(document.body.contains(trigger)).toBe(true);
    expect(getTriggerButton(trigger)).toBeInstanceOf(HTMLButtonElement);
  });

  test("given_trigger_click_when_modal_open_then_dialog_visible", () => {
    const host = hostWith();
    document.body.appendChild(host);

    const instance = initFeedbackWidget(host);
    const trigger = instance.trigger as HTMLElement;
    const modal = instance.modal;

    expect(modal).toBeDefined();
    getTriggerButton(trigger).click();

    expect(modal?.isOpen()).toBe(true);
    expect(getModalOverlay(modal?.host as HTMLElement).hidden).toBe(false);
  });

  test("given_init_when_feedback_panel_then_contains_feedback_form", () => {
    const host = hostWith();
    document.body.appendChild(host);

    const instance = initFeedbackWidget(host);
    const modalHost = instance.modal?.host as HTMLElement;
    const feedbackPanel = modalHost.shadowRoot?.querySelector("#fw-panel-feedback");

    expect(feedbackPanel?.querySelector(".fw-feedback-form")).not.toBeNull();
  });

  test("given_init_when_contact_panel_then_contains_contact_form", () => {
    const host = hostWith();
    document.body.appendChild(host);

    const instance = initFeedbackWidget(host);
    const modalHost = instance.modal?.host as HTMLElement;
    const contactPanel = modalHost.shadowRoot?.querySelector("#fw-panel-contact");

    expect(contactPanel?.querySelector(".fw-contact-form")).not.toBeNull();
  });
});
