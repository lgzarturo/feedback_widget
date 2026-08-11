import { createModalAnimationController } from "../animations/modal-scene";
import type { WidgetConfig } from "../config/types";
import { type TabItem, createTabs } from "./tabs";

const DEFAULT_MODAL_TABS: TabItem[] = [
  { id: "feedback", label: "Feedback" },
  { id: "contact", label: "Contacto" },
];

const CLOSE_ARIA_LABEL = "Cerrar";

export interface FeedbackModal {
  host: HTMLElement;
  open(): void;
  close(): void;
  isOpen(): boolean;
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
      overflow: auto;
      padding: 16px;
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

export function createFeedbackModal(config: WidgetConfig): FeedbackModal {
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

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "fw-modal-close";
  closeButton.setAttribute("aria-label", CLOSE_ARIA_LABEL);
  closeButton.textContent = "×";

  header.appendChild(tabs.tablist);
  header.appendChild(closeButton);

  dialog.appendChild(header);
  dialog.appendChild(tabs.panels);
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
