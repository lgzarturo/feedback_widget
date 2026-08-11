import { afterEach, describe, expect, test } from "bun:test";
import { DEFAULT_WIDGET_CONFIG } from "../../src/config/parse";
import type { WidgetConfig } from "../../src/config/types";
import {
  type FeedbackFormController,
  type FeedbackFormPayload,
  createFeedbackForm,
} from "../../src/ui/feedback-form";

function configWith(overrides: Partial<WidgetConfig> = {}): WidgetConfig {
  return { ...DEFAULT_WIDGET_CONFIG, ...overrides };
}

function resetDom(): void {
  document.body.innerHTML = "";
}

function getEmojiOptions(root: HTMLElement): HTMLButtonElement[] {
  return [...root.querySelectorAll(".fw-emoji-option")].filter(
    (el): el is HTMLButtonElement => el instanceof HTMLButtonElement,
  );
}

function getSubmitButton(root: HTMLElement): HTMLButtonElement {
  const button = root.querySelector(".fw-submit");
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("Submit button not found");
  }
  return button;
}

function getValidationError(root: HTMLElement): HTMLElement {
  const error = root.querySelector(".fw-validation-error");
  if (!(error instanceof HTMLElement)) {
    throw new Error("Validation error element not found");
  }
  return error;
}

function getCommentTextarea(root: HTMLElement): HTMLTextAreaElement {
  const textarea = root.querySelector(".fw-comment");
  if (!(textarea instanceof HTMLTextAreaElement)) {
    throw new Error("Comment textarea not found");
  }
  return textarea;
}

function getCharCounter(root: HTMLElement): HTMLElement {
  const counter = root.querySelector(".fw-char-counter");
  if (!(counter instanceof HTMLElement)) {
    throw new Error("Char counter not found");
  }
  return counter;
}

function mountForm(
  overrides: Partial<WidgetConfig> = {},
  onSubmit?: (payload: FeedbackFormPayload) => void,
): FeedbackFormController {
  const form = createFeedbackForm(configWith(overrides), onSubmit);
  document.body.appendChild(form.root);
  return form;
}

function dispatchKey(element: HTMLElement, key: string): void {
  element.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
}

describe("BC-007 createFeedbackForm", () => {
  afterEach(() => {
    resetDom();
  });

  test("given_form_rendered_when_inspected_then_five_emoji_options_visible", () => {
    const form = mountForm();

    const options = getEmojiOptions(form.root);
    expect(options).toHaveLength(5);
    expect(options.map((btn) => btn.textContent)).toEqual(["😠", "😕", "😐", "🙂", "😍"]);
    expect(form.root.querySelector('[role="radiogroup"]')).not.toBeNull();
  });

  test("given_emoji_clicked_when_inspected_then_aria_checked_and_submit_enabled", () => {
    const form = mountForm();
    const options = getEmojiOptions(form.root);
    const submit = getSubmitButton(form.root);

    expect(submit.disabled).toBe(true);

    options[4]?.click();

    expect(options[4]?.getAttribute("aria-checked")).toBe("true");
    expect(form.getSelectedRating()).toBe(5);
    expect(submit.disabled).toBe(false);
  });

  test("given_emoji_selected_when_submit_then_onSubmit_called_without_comment", () => {
    let received: FeedbackFormPayload | undefined;
    const form = mountForm({}, (payload) => {
      received = payload;
    });

    getEmojiOptions(form.root)[2]?.click();
    getSubmitButton(form.root).click();

    expect(received).toBeDefined();
    expect(received?.rating).toBe(3);
    expect(received?.ratingEmoji).toBe("😐");
    expect(received?.comment).toBe("");
    expect(received?.formType).toBe("feedback");
  });

  test("given_emoji_selected_with_empty_comment_when_submit_then_payload_comment_is_empty", () => {
    const form = mountForm();

    getEmojiOptions(form.root)[0]?.click();
    const payload = form.getPayload();

    expect(payload).toEqual({
      rating: 1,
      ratingEmoji: "😠",
      comment: "",
      formType: "feedback",
    });
  });

  test("given_emoji_and_comment_when_submit_then_payload_includes_rating_ratingEmoji_formType", () => {
    let received: FeedbackFormPayload | undefined;
    const form = mountForm({}, (payload) => {
      received = payload;
    });

    getEmojiOptions(form.root)[3]?.click();
    getCommentTextarea(form.root).value = "Excelente servicio";
    getSubmitButton(form.root).click();

    expect(received).toEqual({
      rating: 4,
      ratingEmoji: "🙂",
      comment: "Excelente servicio",
      formType: "feedback",
    });
  });

  test("given_no_emoji_selected_when_submit_then_shows_error_and_onSubmit_not_called", () => {
    let called = false;
    const form = mountForm({}, () => {
      called = true;
    });

    const error = getValidationError(form.root);
    expect(error.hidden).toBe(true);

    const result = form.submit();

    expect(result).toBe(false);
    expect(called).toBe(false);
    expect(error.hidden).toBe(false);
    expect(error.textContent).toBe("Selecciona una opción");
  });

  test("given_comment_over_500_chars_when_typed_then_counter_reflects_limit", () => {
    const form = mountForm();
    const textarea = getCommentTextarea(form.root);
    const counter = getCharCounter(form.root);

    textarea.value = "a".repeat(501);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    expect(textarea.value).toHaveLength(500);
    expect(counter.textContent).toBe("500/500");
  });

  test("given_global_styles_when_form_created_then_styles_scoped_in_root", () => {
    const form = mountForm({ primaryColor: "#ff5500" });
    const styleText = form.root.querySelector("style")?.textContent ?? "";

    expect(styleText).toContain("#ff5500");
    expect(document.head.querySelector("[data-feedback-form-styles]")).toBeNull();
  });

  test("given_emoji_focused_when_space_pressed_then_selects_rating", () => {
    const form = mountForm();
    const options = getEmojiOptions(form.root);

    options[2]?.focus();
    dispatchKey(options[2] as HTMLElement, " ");

    expect(form.getSelectedRating()).toBe(3);
    expect(options[2]?.getAttribute("aria-checked")).toBe("true");
    expect(getSubmitButton(form.root).disabled).toBe(false);
  });

  test("given_emoji_focused_when_enter_pressed_then_selects_rating", () => {
    const form = mountForm();
    const options = getEmojiOptions(form.root);

    options[4]?.focus();
    dispatchKey(options[4] as HTMLElement, "Enter");

    expect(form.getSelectedRating()).toBe(5);
    expect(options[4]?.getAttribute("aria-checked")).toBe("true");
  });

  test("given_first_emoji_focused_when_arrow_right_pressed_then_selects_next_and_moves_focus", () => {
    const form = mountForm();
    const options = getEmojiOptions(form.root);

    options[0]?.focus();
    dispatchKey(options[0] as HTMLElement, "ArrowRight");

    expect(form.getSelectedRating()).toBe(2);
    expect(document.activeElement).toBe(options[1]);
    expect(options[1]?.getAttribute("aria-checked")).toBe("true");
  });

  test("given_second_emoji_focused_when_arrow_left_pressed_then_selects_prev_and_moves_focus", () => {
    const form = mountForm();
    const options = getEmojiOptions(form.root);

    options[1]?.focus();
    dispatchKey(options[1] as HTMLElement, "ArrowLeft");

    expect(form.getSelectedRating()).toBe(1);
    expect(document.activeElement).toBe(options[0]);
    expect(options[0]?.getAttribute("aria-checked")).toBe("true");
  });

  test("given_last_emoji_focused_when_arrow_right_pressed_then_wraps_to_first_rating", () => {
    const form = mountForm();
    const options = getEmojiOptions(form.root);

    options[4]?.focus();
    dispatchKey(options[4] as HTMLElement, "ArrowRight");

    expect(form.getSelectedRating()).toBe(1);
    expect(document.activeElement).toBe(options[0]);
  });

  test("given_emoji_selected_when_submit_button_clicked_then_invokes_onSubmit", () => {
    let received: FeedbackFormPayload | undefined;
    const form = mountForm({}, (payload) => {
      received = payload;
    });

    getEmojiOptions(form.root)[1]?.click();
    getSubmitButton(form.root).click();

    expect(received?.rating).toBe(2);
    expect(received?.ratingEmoji).toBe("😕");
  });

  test("given_comment_typed_when_input_event_then_counter_updates", () => {
    const form = mountForm();
    const textarea = getCommentTextarea(form.root);
    const counter = getCharCounter(form.root);

    textarea.value = "Hola";
    textarea.dispatchEvent(new Event("input", { bubbles: true }));

    expect(counter.textContent).toBe("4/500");
  });
});
