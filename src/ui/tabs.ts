export type TabId = "feedback" | "contact";

export interface TabItem {
  id: TabId;
  label: string;
}

export interface TabsController {
  tablist: HTMLElement;
  panels: HTMLElement;
  getActiveTab(): TabId;
  setActiveTab(id: TabId): void;
}

function getTabIndex(items: TabItem[], id: TabId): number {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error(`Tab id not found: ${id}`);
  }
  return index;
}

export function createTabs(items: TabItem[], initialActive?: TabId): TabsController {
  const activeId = initialActive ?? items[0]?.id ?? "feedback";
  let currentActive = activeId;

  const tablist = document.createElement("div");
  tablist.setAttribute("role", "tablist");
  tablist.className = "fw-tabs";

  const panels = document.createElement("div");
  panels.className = "fw-tabs-panels";

  const tabButtons: HTMLButtonElement[] = [];
  const panelElements: HTMLElement[] = [];

  for (const item of items) {
    const tabId = `fw-tab-${item.id}`;
    const panelId = `fw-panel-${item.id}`;

    const tab = document.createElement("button");
    tab.type = "button";
    tab.setAttribute("role", "tab");
    tab.id = tabId;
    tab.setAttribute("aria-controls", panelId);
    tab.textContent = item.label;

    const panel = document.createElement("div");
    panel.setAttribute("role", "tabpanel");
    panel.id = panelId;
    panel.setAttribute("aria-labelledby", tabId);

    tabButtons.push(tab);
    panelElements.push(panel);
    tablist.appendChild(tab);
    panels.appendChild(panel);
  }

  function updateTabState(): void {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const tab = tabButtons[i];
      const panel = panelElements[i];
      if (!item || !tab || !panel) {
        continue;
      }

      const isActive = item.id === currentActive;
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      panel.hidden = !isActive;
      panel.setAttribute("aria-hidden", String(!isActive));
    }
  }

  function setActiveTab(id: TabId): void {
    currentActive = id;
    updateTabState();
  }

  function getActiveTab(): TabId {
    return currentActive;
  }

  function focusTabAt(index: number): void {
    const tab = tabButtons[index];
    const item = items[index];
    if (!tab || !item) {
      return;
    }
    setActiveTab(item.id);
    tab.focus();
  }

  for (let i = 0; i < tabButtons.length; i++) {
    const tab = tabButtons[i];
    if (!tab) {
      continue;
    }

    tab.addEventListener("keydown", (event) => {
      const currentIndex = getTabIndex(items, currentActive);

      if (event.key === "ArrowRight") {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        focusTabAt(nextIndex);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        focusTabAt(prevIndex);
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const item = items[i];
        if (item) {
          setActiveTab(item.id);
        }
      }
    });

    tab.addEventListener("click", () => {
      const item = items[i];
      if (item) {
        setActiveTab(item.id);
      }
    });
  }

  updateTabState();

  return {
    tablist,
    panels,
    getActiveTab,
    setActiveTab,
  };
}
