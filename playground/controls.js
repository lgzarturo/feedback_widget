const POSITION_OFFSET = "24px";

const POSITION_STYLES = {
  "bottom-right": { top: "auto", right: POSITION_OFFSET, bottom: POSITION_OFFSET, left: "auto" },
  "bottom-left": { top: "auto", right: "auto", bottom: POSITION_OFFSET, left: POSITION_OFFSET },
  "top-right": { top: POSITION_OFFSET, right: POSITION_OFFSET, bottom: "auto", left: "auto" },
  "top-left": { top: POSITION_OFFSET, right: "auto", bottom: "auto", left: POSITION_OFFSET },
};

function getHost() {
  return document.getElementById("widget-host");
}

function getTriggerHost() {
  return document.querySelector(".fw-trigger-host");
}

function updateAttrsDisplay() {
  const host = getHost();
  const display = document.getElementById("attrs-display");
  if (!host || !display) {
    return;
  }

  display.textContent = [
    `data-position="${host.getAttribute("data-position") ?? ""}"`,
    `data-primary-color="${host.getAttribute("data-primary-color") ?? ""}"`,
    `data-accent-color="${host.getAttribute("data-accent-color") ?? ""}"`,
  ].join("\n");
}

function applyPosition(position) {
  const host = getHost();
  const trigger = getTriggerHost();
  const styles = POSITION_STYLES[position];

  if (host) {
    host.setAttribute("data-position", position);
  }

  if (trigger && styles) {
    trigger.style.position = "fixed";
    trigger.style.top = styles.top;
    trigger.style.right = styles.right;
    trigger.style.bottom = styles.bottom;
    trigger.style.left = styles.left;
  }
}

function updateShadowPrimaryColor(color) {
  const trigger = getTriggerHost();
  if (!trigger?.shadowRoot) {
    return;
  }

  const styleEl = trigger.shadowRoot.querySelector("style");
  if (!styleEl) {
    return;
  }

  styleEl.textContent = styleEl.textContent.replace(
    /background-color:\s*[^;]+;/,
    `background-color: ${color};`,
  );
}

function updateShadowAccentColor(color) {
  const roots = [document.querySelector(".fw-modal-host")];

  for (const host of roots) {
    if (!(host instanceof HTMLElement) || !host.shadowRoot) {
      continue;
    }

    const styleEls = host.shadowRoot.querySelectorAll("style");
    for (const styleEl of styleEls) {
      styleEl.textContent = styleEl.textContent.replace(
        /\.fw-submit[^{]*\{[^}]*background-color:\s*[^;]+;/g,
        (match) => match.replace(/background-color:\s*[^;]+;/, `background-color: ${color};`),
      );
    }

    const panels = host.shadowRoot.querySelectorAll("[id^='fw-panel-']");
    for (const panel of panels) {
      if (!(panel instanceof HTMLElement)) {
        continue;
      }
      for (const child of panel.children) {
        if (!(child instanceof HTMLElement) || !child.shadowRoot) {
          continue;
        }
        const formStyles = child.shadowRoot.querySelectorAll("style");
        for (const styleEl of formStyles) {
          styleEl.textContent = styleEl.textContent.replace(
            /background-color:\s*[^;]+;/g,
            `background-color: ${color};`,
          );
        }
      }
    }
  }
}

function applyLiveStyles() {
  const host = getHost();
  if (!host) {
    return;
  }

  const position = host.getAttribute("data-position") ?? "bottom-right";
  const primaryColor = host.getAttribute("data-primary-color") ?? "#2563eb";
  const accentColor = host.getAttribute("data-accent-color") ?? "#1d4ed8";

  applyPosition(position);
  updateShadowPrimaryColor(primaryColor);
  updateShadowAccentColor(accentColor);
  updateAttrsDisplay();
}

function syncFromControls() {
  const host = getHost();
  const positionSelect = document.getElementById("ctrl-position");
  const primaryInput = document.getElementById("ctrl-primary-color");
  const accentInput = document.getElementById("ctrl-accent-color");

  if (!host || !(positionSelect instanceof HTMLSelectElement)) {
    return;
  }

  host.setAttribute("data-position", positionSelect.value);

  if (primaryInput instanceof HTMLInputElement) {
    host.setAttribute("data-primary-color", primaryInput.value);
  }

  if (accentInput instanceof HTMLInputElement) {
    host.setAttribute("data-accent-color", accentInput.value);
  }

  applyLiveStyles();
}

function initControls() {
  const host = getHost();
  const positionSelect = document.getElementById("ctrl-position");
  const primaryInput = document.getElementById("ctrl-primary-color");
  const accentInput = document.getElementById("ctrl-accent-color");

  if (!host) {
    return;
  }

  const position = host.getAttribute("data-position") ?? "bottom-right";
  const primaryColor = host.getAttribute("data-primary-color") ?? "#2563eb";
  const accentColor = host.getAttribute("data-accent-color") ?? "#1d4ed8";

  if (positionSelect instanceof HTMLSelectElement) {
    positionSelect.value = position;
    positionSelect.addEventListener("change", syncFromControls);
  }

  if (primaryInput instanceof HTMLInputElement) {
    primaryInput.value = primaryColor;
    primaryInput.addEventListener("input", syncFromControls);
  }

  if (accentInput instanceof HTMLInputElement) {
    accentInput.value = accentColor;
    accentInput.addEventListener("input", syncFromControls);
  }

  applyLiveStyles();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initControls, 100);
  });
} else {
  setTimeout(initControls, 100);
}
