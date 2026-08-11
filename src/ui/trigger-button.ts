import type { WidgetConfig } from "../config/types";
import { applyHostPosition, buildTriggerButtonStyles } from "./styles";

const TRIGGER_ARIA_LABEL = "Enviar feedback";

export function createTriggerButton(config: WidgetConfig, onActivate?: () => void): HTMLElement {
  const host = document.createElement("div");
  host.className = "fw-trigger-host";

  applyHostPosition(host, config);

  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = buildTriggerButtonStyles(config);
  shadow.appendChild(style);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "fw-trigger";
  button.setAttribute("aria-label", TRIGGER_ARIA_LABEL);
  button.textContent = "💬";

  if (onActivate) {
    button.addEventListener("click", onActivate);
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onActivate();
      }
    });
  }

  shadow.appendChild(button);

  return host;
}
