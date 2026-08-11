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
