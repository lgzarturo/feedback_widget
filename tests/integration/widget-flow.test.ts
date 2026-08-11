import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { initFeedbackWidget } from "../../src/bootstrap";

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

function getTriggerButton(triggerHost: HTMLElement): HTMLButtonElement {
  const button = triggerHost.shadowRoot?.querySelector("button");
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("Trigger button not found in shadow root");
  }
  return button;
}

function getModalShadow(modalHost: HTMLElement): ShadowRoot {
  const shadow = modalHost.shadowRoot;
  if (!shadow) {
    throw new Error("Modal shadow root not found");
  }
  return shadow;
}

function getModalOverlay(modalHost: HTMLElement): HTMLElement {
  const overlay = getModalShadow(modalHost).querySelector(".fw-modal-overlay");
  if (!(overlay instanceof HTMLElement)) {
    throw new Error("Modal overlay not found");
  }
  return overlay;
}

function getFeedbackPanel(modalHost: HTMLElement): HTMLElement {
  const panel = getModalShadow(modalHost).querySelector("#fw-panel-feedback");
  if (!(panel instanceof HTMLElement)) {
    throw new Error("Feedback panel not found");
  }
  return panel;
}

function getContactPanel(modalHost: HTMLElement): HTMLElement {
  const panel = getModalShadow(modalHost).querySelector("#fw-panel-contact");
  if (!(panel instanceof HTMLElement)) {
    throw new Error("Contact panel not found");
  }
  return panel;
}

function getTabButtons(modalHost: HTMLElement): HTMLButtonElement[] {
  return [...getModalShadow(modalHost).querySelectorAll('[role="tab"]')].filter(
    (el): el is HTMLButtonElement => el instanceof HTMLButtonElement,
  );
}

function getActiveTab(modalHost: HTMLElement): HTMLButtonElement | null {
  return getModalShadow(modalHost).querySelector('[role="tab"][aria-selected="true"]') ?? null;
}

interface CapturedRequest {
  url: string;
  init: RequestInit;
}

interface FetchMock {
  captured: CapturedRequest[];
  restore: () => void;
}

function mockGlobalFetch(status = 201): FetchMock {
  const captured: CapturedRequest[] = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    captured.push({ url: String(url), init: init ?? {} });
    return new Response(null, { status, statusText: String(status) });
  }) as typeof fetch;

  return {
    captured,
    restore: () => {
      globalThis.fetch = originalFetch;
    },
  };
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

function initWidgetWithApiKey(): ReturnType<typeof initFeedbackWidget> {
  const host = hostWith({
    "data-api-key": "test-integration-key",
    "data-base-url": "https://api.appsutiles.dev",
    "data-source": "integration-test",
    "data-locale": "es",
  });
  document.body.appendChild(host);
  return initFeedbackWidget(host);
}

function openModal(instance: ReturnType<typeof initFeedbackWidget>): void {
  const trigger = instance.trigger;
  if (!trigger) {
    throw new Error("Trigger not mounted");
  }
  getTriggerButton(trigger).click();
}

describe("BC-013 widget-flow", () => {
  let fetchMock: FetchMock;

  beforeEach(() => {
    fetchMock = mockGlobalFetch(201);
  });

  afterEach(() => {
    fetchMock.restore();
    resetDom();
  });

  test("given_widget_initialized_when_open_select_emoji_and_submit_then_fetch_receives_feedback_payload", async () => {
    const instance = initWidgetWithApiKey();
    const modal = instance.modal;
    expect(modal).toBeDefined();

    openModal(instance);
    expect(modal?.isOpen()).toBe(true);
    expect(getModalOverlay(modal?.host as HTMLElement).hidden).toBe(false);

    const feedbackPanel = getFeedbackPanel(modal?.host as HTMLElement);
    const emojiOptions = [...feedbackPanel.querySelectorAll(".fw-emoji-option")].filter(
      (el): el is HTMLButtonElement => el instanceof HTMLButtonElement,
    );
    expect(emojiOptions).toHaveLength(5);

    const submitButton = feedbackPanel.querySelector(".fw-submit");
    expect(submitButton instanceof HTMLButtonElement && submitButton.disabled).toBe(true);

    emojiOptions[3]?.click();
    expect(emojiOptions[3]?.getAttribute("aria-checked")).toBe("true");
    expect(submitButton instanceof HTMLButtonElement && submitButton.disabled).toBe(false);

    const comment = feedbackPanel.querySelector(".fw-comment");
    if (comment instanceof HTMLTextAreaElement) {
      comment.value = "Excelente integración";
    }

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.click();
    }

    await flushMicrotasks();

    expect(fetchMock.captured).toHaveLength(1);
    const request = fetchMock.captured[0];
    expect(request?.url).toBe("https://api.appsutiles.dev/v1/contact/messages");
    expect(request?.init.method).toBe("POST");

    const headers = request?.init.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["x-api-key"]).toBe("test-integration-key");

    const body = JSON.parse(String(request?.init.body));
    expect(body.message).toBe("Excelente integración");
    expect(body.locale).toBe("es");
    expect(body.source).toBe("integration-test");
    expect(body.metadata).toEqual({
      formType: "feedback",
      rating: 4,
      ratingEmoji: "🙂",
      comment: "Excelente integración",
    });
  });

  test("given_widget_initialized_when_contact_tab_submit_then_fetch_receives_contact_without_feedback_interaction", async () => {
    const instance = initWidgetWithApiKey();
    const modal = instance.modal;
    expect(modal).toBeDefined();

    openModal(instance);

    const modalHost = modal?.host as HTMLElement;
    const tabs = getTabButtons(modalHost);
    expect(tabs[1]?.textContent).toBe("Contacto");

    tabs[1]?.click();
    expect(getActiveTab(modalHost)?.textContent).toBe("Contacto");

    const feedbackPanel = getFeedbackPanel(modalHost);
    const selectedEmoji = feedbackPanel.querySelector('.fw-emoji-option[aria-checked="true"]');
    expect(selectedEmoji).toBeNull();

    const contactPanel = getContactPanel(modalHost);
    const nameInput = contactPanel.querySelector("#fw-contact-name");
    const emailInput = contactPanel.querySelector("#fw-contact-email");
    const messageInput = contactPanel.querySelector("#fw-contact-message");
    const contactSubmit = contactPanel.querySelector(".fw-submit");

    if (nameInput instanceof HTMLInputElement) {
      nameInput.value = "Ana López";
    }
    if (emailInput instanceof HTMLInputElement) {
      emailInput.value = "ana@example.com";
    }
    if (messageInput instanceof HTMLTextAreaElement) {
      messageInput.value = "Consulta desde widget";
    }
    if (contactSubmit instanceof HTMLButtonElement) {
      contactSubmit.click();
    }

    await flushMicrotasks();

    expect(getActiveTab(modalHost)?.textContent).toBe("Contacto");
    expect(feedbackPanel.querySelector('.fw-emoji-option[aria-checked="true"]')).toBeNull();

    expect(fetchMock.captured).toHaveLength(1);
    const request = fetchMock.captured[0];
    const body = JSON.parse(String(request?.init.body));

    expect(body.name).toBe("Ana López");
    expect(body.email).toBe("ana@example.com");
    expect(body.message).toBe("Consulta desde widget");
    expect(body.metadata).toEqual({ formType: "contact" });
    expect("rating" in body.metadata).toBe(false);
    expect("ratingEmoji" in body.metadata).toBe(false);
  });

  test("given_api_returns_401_when_feedback_submit_then_request_still_sent", async () => {
    fetchMock.restore();
    fetchMock = mockGlobalFetch(401);

    const instance = initWidgetWithApiKey();
    openModal(instance);

    const modalHost = instance.modal?.host as HTMLElement;
    const feedbackPanel = getFeedbackPanel(modalHost);
    const emojiOptions = [...feedbackPanel.querySelectorAll(".fw-emoji-option")].filter(
      (el): el is HTMLButtonElement => el instanceof HTMLButtonElement,
    );

    emojiOptions[2]?.click();
    const submitButton = feedbackPanel.querySelector(".fw-submit");
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.click();
    }

    await flushMicrotasks();

    expect(fetchMock.captured).toHaveLength(1);
    const body = JSON.parse(String(fetchMock.captured[0]?.init.body));
    expect(body.metadata.formType).toBe("feedback");
    expect(body.metadata.rating).toBe(3);
  });
});

describe("BC-013 widget-flow helpers", () => {
  test("given_trigger_without_shadow_button_when_getTriggerButton_then_throws", () => {
    const bareHost = document.createElement("div");
    expect(() => getTriggerButton(bareHost)).toThrow("Trigger button not found in shadow root");
  });

  test("given_modal_without_shadow_root_when_getModalShadow_then_throws", () => {
    const bareHost = document.createElement("div");
    expect(() => getModalShadow(bareHost)).toThrow("Modal shadow root not found");
  });

  test("given_modal_without_overlay_when_getModalOverlay_then_throws", () => {
    const bareHost = document.createElement("div");
    bareHost.attachShadow({ mode: "open" });
    expect(() => getModalOverlay(bareHost)).toThrow("Modal overlay not found");
  });

  test("given_modal_without_feedback_panel_when_getFeedbackPanel_then_throws", () => {
    const bareHost = document.createElement("div");
    bareHost.attachShadow({ mode: "open" });
    expect(() => getFeedbackPanel(bareHost)).toThrow("Feedback panel not found");
  });

  test("given_modal_without_contact_panel_when_getContactPanel_then_throws", () => {
    const bareHost = document.createElement("div");
    bareHost.attachShadow({ mode: "open" });
    expect(() => getContactPanel(bareHost)).toThrow("Contact panel not found");
  });
});
