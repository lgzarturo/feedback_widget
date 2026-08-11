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
  button.setAttribute("aria-label", TRIGGER_ARIA_LABEL);
  button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256"><path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM84,116a12,12,0,1,0,12,12A12,12,0,0,0,84,116Zm88,0a12,12,0,1,0,12,12A12,12,0,0,0,172,116Zm60,12A104,104,0,0,1,79.12,219.82L45.07,231.17a16,16,0,0,1-20.24-20.24l11.35-34.05A104,104,0,1,1,232,128Zm-16,0A88,88,0,1,0,51.81,172.06a8,8,0,0,1,.66,6.54L40,216,77.4,203.53a7.85,7.85,0,0,1,2.53-.42,8,8,0,0,1,4,1.08A88,88,0,0,0,216,128Z"></path></svg>`;

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
