import { afterEach, describe, expect, test } from "bun:test";
import { DEFAULT_WIDGET_CONFIG } from "../../src/config/parse";
import type { WidgetConfig } from "../../src/config/types";
import {
  type ContactFormController,
  type ContactFormPayload,
  createContactForm,
} from "../../src/ui/contact-form";
import { createTabs } from "../../src/ui/tabs";

const DEFAULT_TABS = [
  { id: "feedback" as const, label: "Feedback" },
  { id: "contact" as const, label: "Contacto" },
];

function configWith(overrides: Partial<WidgetConfig> = {}): WidgetConfig {
  return { ...DEFAULT_WIDGET_CONFIG, ...overrides };
}

function resetDom(): void {
  document.body.innerHTML = "";
}

function getNameInput(root: HTMLElement): HTMLInputElement {
  const input = root.querySelector("#fw-contact-name");
  if (!(input instanceof HTMLInputElement)) {
    throw new Error("Name input not found");
  }
  return input;
}

function getEmailInput(root: HTMLElement): HTMLInputElement {
  const input = root.querySelector("#fw-contact-email");
  if (!(input instanceof HTMLInputElement)) {
    throw new Error("Email input not found");
  }
  return input;
}

function getMessageTextarea(root: HTMLElement): HTMLTextAreaElement {
  const textarea = root.querySelector("#fw-contact-message");
  if (!(textarea instanceof HTMLTextAreaElement)) {
    throw new Error("Message textarea not found");
  }
  return textarea;
}

function getSubmitButton(root: HTMLElement): HTMLButtonElement {
  const button = root.querySelector(".fw-submit");
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("Submit button not found");
  }
  return button;
}

function getFieldError(root: HTMLElement, fieldId: string): HTMLElement {
  const error = root.querySelector(`#${fieldId}-error`);
  if (!(error instanceof HTMLElement)) {
    throw new Error(`Field error for ${fieldId} not found`);
  }
  return error;
}

function getCharCounter(root: HTMLElement): HTMLElement {
  const counter = root.querySelector(".fw-char-counter");
  if (!(counter instanceof HTMLElement)) {
    throw new Error("Char counter not found");
  }
  return counter;
}

function fillValidForm(root: HTMLElement): void {
  getNameInput(root).value = "  Juan Pérez  ";
  getEmailInput(root).value = "juan@example.com";
  getMessageTextarea(root).value = "Hola, necesito ayuda";
}

function mountForm(
  overrides: Partial<WidgetConfig> = {},
  onSubmit?: (payload: ContactFormPayload) => void,
): ContactFormController {
  const form = createContactForm(configWith(overrides), onSubmit);
  document.body.appendChild(form.root);
  return form;
}

describe("BC-008 createContactForm", () => {
  afterEach(() => {
    resetDom();
  });

  test("given_form_rendered_when_inspected_then_name_email_message_have_accessible_labels", () => {
    const form = mountForm();

    const nameLabel = form.root.querySelector('label[for="fw-contact-name"]');
    const emailLabel = form.root.querySelector('label[for="fw-contact-email"]');
    const messageLabel = form.root.querySelector('label[for="fw-contact-message"]');

    expect(nameLabel).not.toBeNull();
    expect(emailLabel).not.toBeNull();
    expect(messageLabel).not.toBeNull();
    expect(nameLabel?.textContent).toBeTruthy();
    expect(emailLabel?.textContent).toBeTruthy();
    expect(messageLabel?.textContent).toBeTruthy();

    expect(getNameInput(form.root).type).toBe("text");
    expect(getEmailInput(form.root).type).toBe("email");
    expect(getMessageTextarea(form.root).tagName).toBe("TEXTAREA");
  });

  test("given_empty_fields_when_submit_then_shows_required_errors_and_onSubmit_not_called", () => {
    let called = false;
    const form = mountForm({}, () => {
      called = true;
    });

    const result = form.submit();

    expect(result).toBe(false);
    expect(called).toBe(false);
    expect(getFieldError(form.root, "fw-contact-name").hidden).toBe(false);
    expect(getFieldError(form.root, "fw-contact-name").textContent).toBe(
      "El nombre es obligatorio",
    );
    expect(getFieldError(form.root, "fw-contact-email").hidden).toBe(false);
    expect(getFieldError(form.root, "fw-contact-email").textContent).toBe(
      "El email es obligatorio",
    );
    expect(getFieldError(form.root, "fw-contact-message").hidden).toBe(false);
    expect(getFieldError(form.root, "fw-contact-message").textContent).toBe(
      "El mensaje es obligatorio",
    );
  });

  test("given_invalid_email_when_submit_then_shows_email_error_and_onSubmit_not_called", () => {
    let called = false;
    const form = mountForm({}, () => {
      called = true;
    });

    getNameInput(form.root).value = "Juan";
    getEmailInput(form.root).value = "not-an-email";
    getMessageTextarea(form.root).value = "Mensaje de prueba";

    const result = form.submit();

    expect(result).toBe(false);
    expect(called).toBe(false);
    expect(getFieldError(form.root, "fw-contact-email").hidden).toBe(false);
    expect(getFieldError(form.root, "fw-contact-email").textContent).toBe(
      "Ingresa un email válido",
    );
  });

  test("given_valid_fields_when_submit_then_payload_includes_formType_contact", () => {
    const form = mountForm();
    fillValidForm(form.root);

    const payload = form.getPayload();

    expect(payload).toEqual({
      name: "Juan Pérez",
      email: "juan@example.com",
      message: "Hola, necesito ayuda",
      formType: "contact",
    });
  });

  test("given_valid_fields_when_submit_then_onSubmit_called_with_trimmed_values", () => {
    let received: ContactFormPayload | undefined;
    const form = mountForm({}, (payload) => {
      received = payload;
    });

    fillValidForm(form.root);
    getSubmitButton(form.root).click();

    expect(received).toEqual({
      name: "Juan Pérez",
      email: "juan@example.com",
      message: "Hola, necesito ayuda",
      formType: "contact",
    });
  });

  test("given_contact_tab_active_when_form_submitted_then_succeeds_without_feedback_interaction", () => {
    let received: ContactFormPayload | undefined;
    const tabs = createTabs(DEFAULT_TABS, "contact");
    document.body.appendChild(tabs.panels);

    const contactPanel = tabs.panels.querySelector("#fw-panel-contact");
    expect(contactPanel).not.toBeNull();
    expect(tabs.getActiveTab()).toBe("contact");

    const form = createContactForm(configWith(), (payload) => {
      received = payload;
    });
    contactPanel?.appendChild(form.root);

    fillValidForm(form.root);
    const result = form.submit();

    expect(result).toBe(true);
    expect(received?.formType).toBe("contact");
    expect(tabs.getActiveTab()).toBe("contact");
  });

  test("given_message_over_1000_chars_when_typed_then_counter_reflects_limit", () => {
    const form = mountForm();
    const textarea = getMessageTextarea(form.root);
    const counter = getCharCounter(form.root);

    textarea.value = "a".repeat(1001);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    expect(textarea.value).toHaveLength(1000);
    expect(counter.textContent).toBe("1000/1000");
  });

  test("given_global_styles_when_form_created_then_styles_scoped_in_root", () => {
    const form = mountForm({ primaryColor: "#ff5500" });
    const styleText = form.root.querySelector("style")?.textContent ?? "";

    expect(styleText).toContain("#ff5500");
    expect(document.head.querySelector("[data-contact-form-styles]")).toBeNull();
  });

  test("given_empty_name_when_blur_then_shows_required_error", () => {
    const form = mountForm();
    const nameInput = getNameInput(form.root);

    nameInput.dispatchEvent(new Event("blur", { bubbles: true }));

    expect(getFieldError(form.root, "fw-contact-name").hidden).toBe(false);
    expect(getFieldError(form.root, "fw-contact-name").textContent).toBe(
      "El nombre es obligatorio",
    );
  });

  test("given_invalid_email_when_blur_then_shows_email_error", () => {
    const form = mountForm();

    getNameInput(form.root).value = "Juan";
    getEmailInput(form.root).value = "invalid";
    getEmailInput(form.root).dispatchEvent(new Event("blur", { bubbles: true }));

    expect(getFieldError(form.root, "fw-contact-email").hidden).toBe(false);
    expect(getFieldError(form.root, "fw-contact-email").textContent).toBe(
      "Ingresa un email válido",
    );
  });

  test("given_valid_field_when_blur_then_clears_previous_error", () => {
    const form = mountForm();
    const nameInput = getNameInput(form.root);

    nameInput.dispatchEvent(new Event("blur", { bubbles: true }));
    expect(getFieldError(form.root, "fw-contact-name").hidden).toBe(false);

    nameInput.value = "Ana";
    nameInput.dispatchEvent(new Event("blur", { bubbles: true }));

    expect(getFieldError(form.root, "fw-contact-name").hidden).toBe(true);
    expect(nameInput.classList.contains("fw-field-input--error")).toBe(false);
  });

  test("given_filled_form_when_reset_then_clears_fields_and_focuses_name", () => {
    const form = mountForm();
    fillValidForm(form.root);
    getNameInput(form.root).dispatchEvent(new Event("blur", { bubbles: true }));
    getMessageTextarea(form.root).value = "a".repeat(20);
    getMessageTextarea(form.root).dispatchEvent(new Event("input", { bubbles: true }));

    form.reset();

    expect(getNameInput(form.root).value).toBe("");
    expect(getEmailInput(form.root).value).toBe("");
    expect(getMessageTextarea(form.root).value).toBe("");
    expect(getCharCounter(form.root).textContent).toBe("0/1000");
    expect(getFieldError(form.root, "fw-contact-name").hidden).toBe(true);
    expect(document.activeElement).toBe(getNameInput(form.root));
  });
});
