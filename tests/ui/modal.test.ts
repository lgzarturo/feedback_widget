import { afterEach, describe, expect, test } from "bun:test";
import { MODAL_CLOSE_MS, MODAL_OPEN_MS } from "../../src/animations/modal-scene";
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

function waitForModalAnimation(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, MODAL_CLOSE_MS + 50);
  });
}

function waitForOpenAnimation(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, MODAL_OPEN_MS + 50);
  });
}

async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

function mockGlobalFetch(status = 201): {
  captured: { url: string; init: RequestInit }[];
  restore: () => void;
} {
  const captured: { url: string; init: RequestInit }[] = [];
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

  test("given_modal_open_when_close_clicked_then_modal_closes", async () => {
    const modal = createFeedbackModal(configWith());
    document.body.appendChild(modal.host);
    modal.open();

    getCloseButton(modal.host).click();

    expect(modal.isOpen()).toBe(false);
    await waitForModalAnimation();
    expect(getModalOverlay(modal.host).hidden).toBe(true);
  });

  test("given_modal_open_when_escape_pressed_then_modal_closes", async () => {
    const modal = createFeedbackModal(configWith());
    document.body.appendChild(modal.host);
    modal.open();

    getDialog(modal.host).dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );

    expect(modal.isOpen()).toBe(false);
    await waitForModalAnimation();
    expect(getModalOverlay(modal.host).hidden).toBe(true);
  });

  test("given_trigger_wired_to_modal_when_button_clicked_then_modal_opens", () => {
    const modal = createFeedbackModal(configWith());
    const trigger = createTriggerButton(configWith(), () => modal.open());
    document.body.append(trigger, modal.host);

    getTriggerButton(trigger).click();

    expect(modal.isOpen()).toBe(true);
  });

  test("given_modal_open_when_tab_pressed_at_last_focusable_then_focus_wraps_to_first", () => {
    const modal = createFeedbackModal(configWith(), { withForms: true });
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

  test("given_modal_closed_after_open_when_reopened_then_restores_default_tab", async () => {
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
    await waitForModalAnimation();
    modal.open();

    const activeTab = modal.host.shadowRoot?.querySelector('[role="tab"][aria-selected="true"]');
    expect(activeTab?.textContent).toBe("Feedback");
    expect(contactTab).toBeDefined();
  });

  test("given_modal_already_open_when_open_called_again_then_stays_open", () => {
    const modal = createFeedbackModal(configWith());
    document.body.appendChild(modal.host);

    modal.open();
    modal.open();

    expect(modal.isOpen()).toBe(true);
    expect(getModalOverlay(modal.host).hidden).toBe(false);
  });

  test("given_modal_closed_when_close_called_then_remains_closed", async () => {
    const modal = createFeedbackModal(configWith());
    document.body.appendChild(modal.host);

    modal.close();

    expect(modal.isOpen()).toBe(false);
    await waitForModalAnimation();
    expect(getModalOverlay(modal.host).hidden).toBe(true);
  });

  test("given_modal_open_when_shift_tab_at_first_focusable_then_focus_wraps_to_last", () => {
    const modal = createFeedbackModal(configWith(), { withForms: true });
    document.body.appendChild(modal.host);
    modal.open();

    const focusable = getFocusableElements(modal.host);
    expect(focusable.length).toBeGreaterThan(1);

    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;
    first.focus();

    getDialog(modal.host).dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }),
    );

    expect(modal.host.shadowRoot?.activeElement).toBe(last);
  });

  test("given_focused_element_before_open_when_modal_closes_then_focus_restored", async () => {
    const externalButton = document.createElement("button");
    externalButton.textContent = "External";
    document.body.appendChild(externalButton);
    externalButton.focus();

    const modal = createFeedbackModal(configWith());
    document.body.appendChild(modal.host);
    modal.open();
    modal.close();

    await waitForModalAnimation();

    expect(document.activeElement).toBe(externalButton);
  });

  test("given_modal_opened_when_animation_completes_then_first_tab_receives_focus", async () => {
    const modal = createFeedbackModal(configWith());
    document.body.appendChild(modal.host);

    modal.open();
    await waitForOpenAnimation();

    const firstTab = modal.host.shadowRoot?.querySelector('[role="tab"][tabindex="0"]');
    expect(modal.host.shadowRoot?.activeElement).toBe(firstTab);
  });

  test("given_modal_with_forms_when_feedback_submitted_then_fetch_receives_payload", async () => {
    const fetchMock = mockGlobalFetch(201);
    const modal = createFeedbackModal(
      configWith({ apiKey: "modal-test-key", baseUrl: "https://api.test.dev" }),
      { withForms: true },
    );
    document.body.appendChild(modal.host);
    modal.open();

    const feedbackPanel = modal.host.shadowRoot?.querySelector("#fw-panel-feedback");
    expect(feedbackPanel).not.toBeNull();

    const emojiOptions = [...(feedbackPanel?.querySelectorAll(".fw-emoji-option") ?? [])].filter(
      (el): el is HTMLButtonElement => el instanceof HTMLButtonElement,
    );
    emojiOptions[3]?.click();

    const submitButton = feedbackPanel?.querySelector(".fw-submit");
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.click();
    }

    await flushMicrotasks();

    expect(fetchMock.captured).toHaveLength(1);
    expect(fetchMock.captured[0]?.url).toBe("https://api.test.dev/v1/contact/messages");
    const body = JSON.parse(String(fetchMock.captured[0]?.init.body));
    expect(body.name).toBe("User Feedback");
    expect(body.email).toBe("lgzarturo@gmail.com");
    expect(body.metadata).toEqual({
      formType: "feedback",
      rating: 4,
      ratingEmoji: "🙂",
    });

    fetchMock.restore();
  });

  test("given_modal_with_forms_when_contact_submitted_then_fetch_receives_contact_payload", async () => {
    const fetchMock = mockGlobalFetch(201);
    const modal = createFeedbackModal(configWith({ apiKey: "modal-test-key" }), {
      withForms: true,
    });
    document.body.appendChild(modal.host);
    modal.open();

    const contactPanel = modal.host.shadowRoot?.querySelector("#fw-panel-contact");
    const contactTab = modal.host.shadowRoot?.querySelectorAll('[role="tab"]')[1];
    if (contactTab instanceof HTMLElement) {
      contactTab.click();
    }

    const nameInput = contactPanel?.querySelector("#fw-contact-name");
    const emailInput = contactPanel?.querySelector("#fw-contact-email");
    const messageInput = contactPanel?.querySelector("#fw-contact-message");
    const submitButton = contactPanel?.querySelector(".fw-submit");

    if (nameInput instanceof HTMLInputElement) {
      nameInput.value = "María";
    }
    if (emailInput instanceof HTMLInputElement) {
      emailInput.value = "maria@example.com";
    }
    if (messageInput instanceof HTMLTextAreaElement) {
      messageInput.value = "Consulta modal";
    }
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.click();
    }

    await flushMicrotasks();

    expect(fetchMock.captured).toHaveLength(1);
    const body = JSON.parse(String(fetchMock.captured[0]?.init.body));
    expect(body.name).toBe("María");
    expect(body.email).toBe("maria@example.com");
    expect(body.metadata).toEqual({ formType: "contact" });

    fetchMock.restore();
  });

  test("given_feedback_submitted_when_api_returns_201_then_shows_success_status", async () => {
    const fetchMock = mockGlobalFetch(201);
    const modal = createFeedbackModal(configWith({ apiKey: "modal-test-key" }), {
      withForms: true,
    });
    document.body.appendChild(modal.host);
    modal.open();

    const feedbackPanel = modal.host.shadowRoot?.querySelector("#fw-panel-feedback");
    const emojiOptions = [...(feedbackPanel?.querySelectorAll(".fw-emoji-option") ?? [])].filter(
      (el): el is HTMLButtonElement => el instanceof HTMLButtonElement,
    );
    emojiOptions[3]?.click();
    const comment = feedbackPanel?.querySelector(".fw-comment");
    if (comment instanceof HTMLTextAreaElement) {
      comment.value = "Muy bueno";
      comment.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const submitButton = feedbackPanel?.querySelector(".fw-submit");
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.click();
    }

    await flushMicrotasks();

    const status = modal.host.shadowRoot?.querySelector(".fw-status");
    expect(status).not.toBeNull();
    expect(status?.getAttribute("role")).toBe("alert");
    expect(status?.textContent).toBe("¡Gracias por tu feedback!");
    expect((status as HTMLElement).hidden).toBe(false);

    expect(emojiOptions.every((btn) => btn.getAttribute("aria-checked") === "false")).toBe(true);
    expect(comment instanceof HTMLTextAreaElement && comment.value).toBe("");
    expect(modal.host.shadowRoot?.activeElement).toBe(emojiOptions[0]);

    fetchMock.restore();
  });

  test("given_api_returns_400_with_error_message_when_feedback_submit_then_shows_extracted_message", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          success: false,
          error: {
            name: "ZodError",
            message: JSON.stringify([
              {
                path: ["name"],
                message: "Too small: expected string to have >=1 characters",
              },
            ]),
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )) as unknown as typeof fetch;

    const modal = createFeedbackModal(configWith({ apiKey: "modal-test-key" }), {
      withForms: true,
    });
    document.body.appendChild(modal.host);
    modal.open();

    const feedbackPanel = modal.host.shadowRoot?.querySelector("#fw-panel-feedback");
    const emojiOptions = [...(feedbackPanel?.querySelectorAll(".fw-emoji-option") ?? [])].filter(
      (el): el is HTMLButtonElement => el instanceof HTMLButtonElement,
    );
    emojiOptions[3]?.click();
    const submitButton = feedbackPanel?.querySelector(".fw-submit");
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.click();
    }

    await flushMicrotasks();
    await flushMicrotasks();

    const status = modal.host.shadowRoot?.querySelector(".fw-status");
    expect(status?.textContent).toBe("Too small: expected string to have >=1 characters");

    globalThis.fetch = originalFetch;
  });

  test("given_contact_submitted_when_fetch_throws_then_shows_network_error", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;

    const modal = createFeedbackModal(configWith({ apiKey: "modal-test-key" }), {
      withForms: true,
    });
    document.body.appendChild(modal.host);
    modal.open();

    const contactPanel = modal.host.shadowRoot?.querySelector("#fw-panel-contact");
    const contactTab = modal.host.shadowRoot?.querySelectorAll('[role="tab"]')[1];
    if (contactTab instanceof HTMLElement) {
      contactTab.click();
    }

    const nameInput = contactPanel?.querySelector("#fw-contact-name");
    const emailInput = contactPanel?.querySelector("#fw-contact-email");
    const messageInput = contactPanel?.querySelector("#fw-contact-message");
    const submitButton = contactPanel?.querySelector(".fw-submit");

    if (nameInput instanceof HTMLInputElement) {
      nameInput.value = "María";
    }
    if (emailInput instanceof HTMLInputElement) {
      emailInput.value = "maria@example.com";
    }
    if (messageInput instanceof HTMLTextAreaElement) {
      messageInput.value = "Consulta modal";
    }
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.click();
    }

    await flushMicrotasks();

    const status = modal.host.shadowRoot?.querySelector(".fw-status");
    expect(status?.getAttribute("role")).toBe("alert");
    expect(status?.textContent).toBe("No se pudo conectar con el servidor. Intenta de nuevo.");

    globalThis.fetch = originalFetch;
  });
});
