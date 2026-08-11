import { afterEach, describe, expect, test } from "bun:test";
import { type TabsController, createTabs } from "../../src/ui/tabs";

const DEFAULT_TABS = [
  { id: "feedback" as const, label: "Feedback" },
  { id: "contact" as const, label: "Contacto" },
];

function resetDom(): void {
  document.body.innerHTML = "";
}

function getTabButtons(controller: TabsController): HTMLButtonElement[] {
  const buttons = controller.tablist.querySelectorAll('[role="tab"]');
  return [...buttons].filter((el): el is HTMLButtonElement => el instanceof HTMLButtonElement);
}

function getActiveTabButton(controller: TabsController): HTMLButtonElement {
  const active = controller.tablist.querySelector('[role="tab"][aria-selected="true"]');
  if (!(active instanceof HTMLButtonElement)) {
    throw new Error("Active tab button not found");
  }
  return active;
}

function dispatchKey(element: HTMLElement, key: string): void {
  element.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

describe("BC-006 createTabs", () => {
  afterEach(() => {
    resetDom();
  });

  test("given_default_tabs_when_created_then_feedback_and_contacto_labels_visible", () => {
    const tabs = createTabs(DEFAULT_TABS);
    document.body.appendChild(tabs.tablist);

    const labels = getTabButtons(tabs).map((btn) => btn.textContent);

    expect(labels).toContain("Feedback");
    expect(labels).toContain("Contacto");
    expect(tabs.tablist.getAttribute("role")).toBe("tablist");
  });

  test("given_feedback_active_when_arrow_right_then_contact_becomes_active", () => {
    const tabs = createTabs(DEFAULT_TABS);
    document.body.appendChild(tabs.tablist);

    const feedbackTab = getTabButtons(tabs)[0];
    feedbackTab.focus();
    dispatchKey(feedbackTab, "ArrowRight");

    expect(tabs.getActiveTab()).toBe("contact");
    expect(getActiveTabButton(tabs).textContent).toBe("Contacto");
  });

  test("given_contact_active_when_arrow_left_then_feedback_becomes_active", () => {
    const tabs = createTabs(DEFAULT_TABS, "contact");
    document.body.appendChild(tabs.tablist);

    const contactTab = getTabButtons(tabs).find((btn) => btn.textContent === "Contacto");
    if (!contactTab) {
      throw new Error("Contact tab not found");
    }
    contactTab.focus();
    dispatchKey(contactTab, "ArrowLeft");

    expect(tabs.getActiveTab()).toBe("feedback");
    expect(getActiveTabButton(tabs).textContent).toBe("Feedback");
  });

  test("given_inactive_tab_focused_when_enter_pressed_then_activates_tab", () => {
    const tabs = createTabs(DEFAULT_TABS);
    document.body.appendChild(tabs.tablist);

    const contactTab = getTabButtons(tabs).find((btn) => btn.textContent === "Contacto");
    if (!contactTab) {
      throw new Error("Contact tab not found");
    }
    contactTab.focus();
    dispatchKey(contactTab, "Enter");

    expect(tabs.getActiveTab()).toBe("contact");
    expect(contactTab.getAttribute("aria-selected")).toBe("true");
  });

  test("given_active_tab_when_set_active_tab_called_then_updates_aria_selected", () => {
    const tabs = createTabs(DEFAULT_TABS);
    document.body.appendChild(tabs.tablist);

    tabs.setActiveTab("contact");

    expect(tabs.getActiveTab()).toBe("contact");
    const contactTab = getTabButtons(tabs).find((btn) => btn.textContent === "Contacto");
    expect(contactTab?.getAttribute("aria-selected")).toBe("true");
    expect(contactTab?.tabIndex).toBe(0);
  });

  test("given_contact_tab_clicked_when_inspected_then_becomes_active", () => {
    const tabs = createTabs(DEFAULT_TABS);
    document.body.appendChild(tabs.tablist);

    const contactTab = getTabButtons(tabs).find((btn) => btn.textContent === "Contacto");
    contactTab?.click();

    expect(tabs.getActiveTab()).toBe("contact");
    expect(contactTab?.getAttribute("aria-selected")).toBe("true");
  });

  test("given_single_tab_when_arrow_right_pressed_then_stays_on_same_tab", () => {
    const tabs = createTabs([{ id: "feedback", label: "Feedback" }]);
    document.body.appendChild(tabs.tablist);

    const tab = getTabButtons(tabs)[0] as HTMLButtonElement;
    tab.focus();
    dispatchKey(tab, "ArrowRight");

    expect(tabs.getActiveTab()).toBe("feedback");
    expect(document.activeElement).toBe(tab);
  });
});
