import { parseFeedbackConfig } from "./config/parse";
import type { WidgetConfig } from "./config/types";
import type { FeedbackModal } from "./ui/modal";
import { createFeedbackModal } from "./ui/modal";
import { createTriggerButton } from "./ui/trigger-button";

const INITIALIZED_ATTR = "data-feedback-initialized";

export interface FeedbackWidgetInstance {
  host: HTMLElement;
  config: WidgetConfig;
  trigger?: HTMLElement;
  modal?: FeedbackModal;
}

const instances = new WeakMap<HTMLElement, FeedbackWidgetInstance>();

function createInstance(host: HTMLElement): FeedbackWidgetInstance {
  const config = parseFeedbackConfig(host);
  const modal = createFeedbackModal(config, { withForms: true });
  const trigger = createTriggerButton(config, () => modal.open());

  document.body.appendChild(trigger);
  document.body.appendChild(modal.host);

  const instance: FeedbackWidgetInstance = { host, config, trigger, modal };
  instances.set(host, instance);
  host.setAttribute(INITIALIZED_ATTR, "");
  return instance;
}

export function initFeedbackWidget(host: HTMLElement): FeedbackWidgetInstance {
  const existing = instances.get(host);
  if (existing) {
    return existing;
  }

  return createInstance(host);
}

function initializeAllHosts(): void {
  const hosts = document.querySelectorAll(`[data-feedback]:not([${INITIALIZED_ATTR}])`);

  for (const element of hosts) {
    if (element instanceof HTMLElement) {
      initFeedbackWidget(element);
    }
  }
}

export function bootstrapFeedbackWidget(): void {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAllHosts);
    return;
  }

  initializeAllHosts();
}
