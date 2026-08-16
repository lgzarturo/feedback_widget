import { createModalAnimationController } from "../animations/modal-scene";
import { sendContactMessage } from "../api/contact-client";
import type { WidgetConfig } from "../config/types";
import { type ContactFormPayload, createContactForm } from "./contact-form";
import { type FeedbackFormPayload, createFeedbackForm } from "./feedback-form";
import { type TabItem, createTabs } from "./tabs";

const DEFAULT_MODAL_TABS: TabItem[] = [
  { id: "feedback", label: "Feedback" },
  { id: "contact", label: "Contacto" },
];

const CLOSE_ARIA_LABEL = "Cerrar";

export interface FeedbackModalOptions {
  withForms?: boolean;
}

export interface FeedbackModal {
  host: HTMLElement;
  open(): void;
  close(): void;
  isOpen(): boolean;
}

const SUCCESS_MESSAGES = {
  feedback: "¡Gracias por tu feedback!",
  contact: "Mensaje enviado",
} as const;

function setStatusMessage(status: HTMLElement, message: string, kind: "success" | "error"): void {
  status.textContent = message;
  status.hidden = false;
  status.dataset.fwStatus = kind;
}

function mountForms(
  config: WidgetConfig,
  tabs: { panels: HTMLElement },
  status: HTMLElement,
): void {
  const feedbackPanel = tabs.panels.querySelector("#fw-panel-feedback");
  const contactPanel = tabs.panels.querySelector("#fw-panel-contact");
  if (!(feedbackPanel instanceof HTMLElement) || !(contactPanel instanceof HTMLElement)) {
    return;
  }

  const formRefs: {
    feedback?: ReturnType<typeof createFeedbackForm>;
    contact?: ReturnType<typeof createContactForm>;
  } = {};

  const submitHandler = (payload: ContactFormPayload | FeedbackFormPayload): void => {
    void sendContactMessage(config, payload).then((result) => {
      if (result.ok) {
        const message =
          payload.formType === "feedback" ? SUCCESS_MESSAGES.feedback : SUCCESS_MESSAGES.contact;
        setStatusMessage(status, message, "success");
        if (payload.formType === "feedback") {
          formRefs.feedback?.reset();
        } else {
          formRefs.contact?.reset();
        }
        return;
      }
      setStatusMessage(status, result.userMessage, "error");
    });
  };

  formRefs.feedback = createFeedbackForm(config, submitHandler);
  formRefs.contact = createContactForm(config, submitHandler);
  feedbackPanel.appendChild(formRefs.feedback.root);
  contactPanel.appendChild(formRefs.contact.root);
}

function buildModalStyles(config: WidgetConfig): string {
  return `
    .fw-modal-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.4);
    }

    .fw-modal-overlay[hidden] {
      display: none;
    }

    .fw-modal-dialog {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      width: min(400px, calc(100vw - 48px));
      max-height: calc(100vh - 48px);
      overflow: hidden;
      padding: 16px;
    }

    .fw-tabs-panels {
      overflow: auto;
      max-height: calc(100vh - 120px);
    }

    .fw-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 16px;
    }

    .fw-tabs [role="tab"] {
      appearance: none;
      border: none;
      background: transparent;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
      color: #666666;
      border-bottom: 2px solid transparent;
    }

    .fw-tabs [role="tab"][aria-selected="true"] {
      color: ${config.primaryColor};
      border-bottom-color: ${config.primaryColor};
      font-weight: 600;
    }

    .fw-tabs [role="tab"]:focus-visible {
      outline: 2px solid ${config.primaryColor};
      outline-offset: 2px;
    }

    .fw-modal-close {
      appearance: none;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
      padding: 4px 8px;
      color: #666666;
    }

    .fw-modal-close:focus-visible {
      outline: 2px solid ${config.primaryColor};
      outline-offset: 2px;
    }

    .fw-status {
      margin-top: 12px;
      padding: 8px 12px;
      font-size: 13px;
      border-radius: 8px;
    }

    .fw-status[hidden] {
      display: none;
    }

    .fw-status[data-fw-status="success"] {
      background: #f0fdf4;
      border-left: 4px solid #22c55e;
      color: #166534;
    }

    .fw-status[data-fw-status="error"] {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      color: #991b1b;
    }
  `.trim();
}

function isFocusable(el: HTMLElement): boolean {
  if (el.hidden) {
    return false;
  }
  if (el.hasAttribute("disabled")) {
    return false;
  }
  return el.tabIndex >= 0;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = "button, [href], input, select, textarea, [tabindex]";
  return [...container.querySelectorAll(selector)].filter(
    (el): el is HTMLElement => el instanceof HTMLElement && isFocusable(el),
  );
}

export function createFeedbackModal(
  config: WidgetConfig,
  options?: FeedbackModalOptions,
): FeedbackModal {
  const host = document.createElement("div");
  host.className = "fw-modal-host";
  host.style.position = "fixed";
  host.style.inset = "0";
  host.style.zIndex = String(config.zIndex);
  host.style.pointerEvents = "none";

  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = buildModalStyles(config);
  shadow.appendChild(style);

  const overlay = document.createElement("div");
  overlay.className = "fw-modal-overlay";
  overlay.hidden = true;

  const dialog = document.createElement("div");
  dialog.className = "fw-modal-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-label", "Feedback");

  const header = document.createElement("div");
  header.className = "fw-modal-header";

  const tabs = createTabs(DEFAULT_MODAL_TABS);

  const status = document.createElement("p");
  status.className = "fw-status";
  status.setAttribute("role", "alert");
  status.hidden = true;

  if (options?.withForms) {
    mountForms(config, tabs, status);
  }

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "fw-modal-close";
  closeButton.setAttribute("aria-label", CLOSE_ARIA_LABEL);
  closeButton.textContent = "×";

  header.appendChild(tabs.tablist);
  header.appendChild(closeButton);

  dialog.appendChild(header);
  dialog.appendChild(tabs.panels);
  dialog.appendChild(status);
  overlay.appendChild(dialog);
  shadow.appendChild(overlay);

  let isOpen = false;
  let previousFocus: Element | null = null;
  const animationController = createModalAnimationController(config, dialog);

  function open(): void {
    if (isOpen) {
      return;
    }
    isOpen = true;
    previousFocus = document.activeElement;
    overlay.hidden = false;
    host.style.pointerEvents = "auto";

    void animationController.playOpen().then(() => {
      const firstTab = tabs.tablist.querySelector('[role="tab"][tabindex="0"]');
      if (firstTab instanceof HTMLElement) {
        firstTab.focus();
      }
    });
  }

  function close(): void {
    if (!isOpen) {
      return;
    }
    isOpen = false;

    void animationController.playClose().then(() => {
      overlay.hidden = true;
      host.style.pointerEvents = "none";
      tabs.setActiveTab("feedback");

      if (previousFocus instanceof HTMLElement) {
        previousFocus.focus();
      }
      previousFocus = null;
    });
  }

  function handleFocusTrap(event: KeyboardEvent): void {
    if (!isOpen || event.key !== "Tab") {
      return;
    }

    const focusable = getFocusableElements(dialog);
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) {
      return;
    }

    const active = shadow.activeElement ?? document.activeElement;

    if (event.shiftKey) {
      if (active === first || !dialog.contains(active)) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  closeButton.addEventListener("click", () => {
    close();
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    handleFocusTrap(event);
  });

  return {
    host,
    open,
    close,
    isOpen: () => isOpen,
  };
}
