import { playValidationErrorFx } from "../animations/validation-fx";
import type { WidgetConfig } from "../config/types";

export interface ContactFormPayload {
  name: string;
  email: string;
  message: string;
  formType: "contact";
}

export interface ContactFormController {
  root: HTMLElement;
  getPayload(): ContactFormPayload | null;
  submit(): boolean;
  reset(): void;
}

type FieldName = "name" | "email" | "message";

interface FieldConfig {
  id: string;
  label: string;
  type: "text" | "email" | "textarea";
  requiredMessage: string;
}

const MAX_MESSAGE_LENGTH = 1000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUBMIT_LABEL = "Enviar mensaje";
const INVALID_EMAIL_MESSAGE = "Ingresa un email válido";

const FIELDS: FieldConfig[] = [
  {
    id: "fw-contact-name",
    label: "Nombre",
    type: "text",
    requiredMessage: "El nombre es obligatorio",
  },
  {
    id: "fw-contact-email",
    label: "Email",
    type: "email",
    requiredMessage: "El email es obligatorio",
  },
  {
    id: "fw-contact-message",
    label: "Mensaje",
    type: "textarea",
    requiredMessage: "El mensaje es obligatorio",
  },
];

function buildContactFormStyles(config: WidgetConfig): string {
  return `
    .fw-contact-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .fw-field-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .fw-field-label {
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }

    .fw-field-input {
      width: 100%;
      min-height: 40px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 14px;
      box-sizing: border-box;
    }

    textarea.fw-field-input {
      min-height: 100px;
      resize: vertical;
    }

    .fw-field-input:focus-visible {
      outline: 2px solid ${config.primaryColor};
      outline-offset: 0;
    }

    .fw-field-input.fw-field-input--error {
      border: 2px solid #ef4444;
    }

    .fw-field-error {
      color: #ef4444;
      font-size: 12px;
      margin: 0;
    }

    .fw-field-error[hidden] {
      display: none;
    }

    .fw-char-counter {
      font-size: 12px;
      color: #6b7280;
      text-align: right;
    }

    .fw-submit {
      width: 100%;
      height: 44px;
      border: none;
      border-radius: 8px;
      background-color: ${config.primaryColor};
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 150ms ease;
    }

    .fw-submit:hover {
      background-color: ${config.accentColor};
    }

    .fw-submit:focus-visible {
      outline: 2px solid ${config.primaryColor};
      outline-offset: 2px;
    }
  `.trim();
}

function updateCharCounter(counter: HTMLElement, length: number): void {
  counter.textContent = `${length}/${MAX_MESSAGE_LENGTH}`;
}

function getFieldNameFromId(id: string): FieldName | null {
  if (id === "fw-contact-name") {
    return "name";
  }
  if (id === "fw-contact-email") {
    return "email";
  }
  if (id === "fw-contact-message") {
    return "message";
  }
  return null;
}

export function createContactForm(
  config: WidgetConfig,
  onSubmit?: (payload: ContactFormPayload) => void,
): ContactFormController {
  const root = document.createElement("div");
  root.className = "fw-contact-form";

  const style = document.createElement("style");
  style.textContent = buildContactFormStyles(config);
  root.appendChild(style);

  const inputs = {} as Record<FieldName, HTMLInputElement | HTMLTextAreaElement>;
  const errors = {} as Record<FieldName, HTMLElement>;

  let charCounter: HTMLElement | null = null;

  for (const field of FIELDS) {
    const fieldName = getFieldNameFromId(field.id);
    if (!fieldName) {
      continue;
    }

    const group = document.createElement("div");
    group.className = "fw-field-group";

    const label = document.createElement("label");
    label.className = "fw-field-label";
    label.htmlFor = field.id;
    label.textContent = field.label;

    const input =
      field.type === "textarea"
        ? document.createElement("textarea")
        : document.createElement("input");
    input.id = field.id;
    input.className = "fw-field-input";
    if (field.type !== "textarea") {
      (input as HTMLInputElement).type = field.type;
    }

    const errorId = `${field.id}-error`;
    const error = document.createElement("p");
    error.id = errorId;
    error.className = "fw-field-error";
    error.setAttribute("role", "alert");
    error.hidden = true;
    input.setAttribute("aria-describedby", errorId);

    inputs[fieldName] = input;
    errors[fieldName] = error;

    group.appendChild(label);
    group.appendChild(input);

    if (fieldName === "message") {
      charCounter = document.createElement("span");
      charCounter.className = "fw-char-counter";
      updateCharCounter(charCounter, 0);
      group.appendChild(charCounter);
    }

    group.appendChild(error);
    root.appendChild(group);
  }

  const submitButton = document.createElement("button");
  submitButton.type = "button";
  submitButton.className = "fw-submit";
  submitButton.textContent = SUBMIT_LABEL;
  root.appendChild(submitButton);

  function getFieldValue(fieldName: FieldName): string {
    return inputs[fieldName].value.trim();
  }

  function setFieldError(fieldName: FieldName, message: string | null): void {
    const input = inputs[fieldName];
    const error = errors[fieldName];

    if (message) {
      error.textContent = message;
      error.hidden = false;
      input.classList.add("fw-field-input--error");
      playValidationErrorFx(config, input);
      return;
    }

    error.hidden = true;
    input.classList.remove("fw-field-input--error");
  }

  function validateField(fieldName: FieldName): boolean {
    const value = getFieldValue(fieldName);
    const fieldConfig = FIELDS.find((f) => getFieldNameFromId(f.id) === fieldName);
    if (!fieldConfig) {
      return false;
    }

    if (value === "") {
      setFieldError(fieldName, fieldConfig.requiredMessage);
      return false;
    }

    if (fieldName === "email" && !EMAIL_REGEX.test(value)) {
      setFieldError(fieldName, INVALID_EMAIL_MESSAGE);
      return false;
    }

    setFieldError(fieldName, null);
    return true;
  }

  function validateAll(): boolean {
    let valid = true;
    for (const fieldName of ["name", "email", "message"] as const) {
      if (!validateField(fieldName)) {
        valid = false;
      }
    }
    return valid;
  }

  function buildPayload(): ContactFormPayload | null {
    if (!validateAll()) {
      return null;
    }
    return {
      name: getFieldValue("name"),
      email: getFieldValue("email"),
      message: getFieldValue("message"),
      formType: "contact",
    };
  }

  function submit(): boolean {
    const payload = buildPayload();
    if (!payload) {
      return false;
    }
    onSubmit?.(payload);
    return true;
  }

  function reset(): void {
    for (const fieldName of ["name", "email", "message"] as const) {
      inputs[fieldName].value = "";
      setFieldError(fieldName, null);
    }
    if (charCounter) {
      updateCharCounter(charCounter, 0);
    }
    inputs.name.focus();
  }

  for (const fieldName of ["name", "email", "message"] as const) {
    inputs[fieldName].addEventListener("blur", () => {
      validateField(fieldName);
    });
  }

  inputs.message.addEventListener("input", () => {
    if (inputs.message.value.length > MAX_MESSAGE_LENGTH) {
      inputs.message.value = inputs.message.value.slice(0, MAX_MESSAGE_LENGTH);
    }
    if (charCounter) {
      updateCharCounter(charCounter, inputs.message.value.length);
    }
  });

  submitButton.addEventListener("click", () => {
    submit();
  });

  return {
    root,
    getPayload: buildPayload,
    submit,
    reset,
  };
}
