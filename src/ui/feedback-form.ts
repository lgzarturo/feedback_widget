import { playValidationErrorFx } from "../animations/validation-fx";
import type { WidgetConfig } from "../config/types";

export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

export interface FeedbackFormPayload {
  rating: FeedbackRating;
  ratingEmoji: string;
  comment: string;
  formType: "feedback";
}

export interface FeedbackFormController {
  root: HTMLElement;
  getSelectedRating(): FeedbackRating | null;
  getPayload(): FeedbackFormPayload | null;
  submit(): boolean;
  reset(): void;
}

interface EmojiOption {
  rating: FeedbackRating;
  emoji: string;
  label: string;
}

const EMOJI_SCALE: EmojiOption[] = [
  { rating: 1, emoji: "😠", label: "Muy insatisfecho" },
  { rating: 2, emoji: "😕", label: "Insatisfecho" },
  { rating: 3, emoji: "😐", label: "Neutral" },
  { rating: 4, emoji: "🙂", label: "Satisfecho" },
  { rating: 5, emoji: "😍", label: "Muy satisfecho" },
];

const MAX_COMMENT_LENGTH = 500;
const VALIDATION_ERROR_MESSAGE = "Selecciona una opción";
const COMMENT_PLACEHOLDER = "¿Algo más que quieras compartir?";
const SUBMIT_LABEL = "Enviar feedback";
const RADIOGROUP_LABEL = "¿Cómo fue tu experiencia?";

function buildFeedbackFormStyles(config: WidgetConfig): string {
  return `
    .fw-feedback-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .fw-emoji-scale {
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    .fw-emoji-option {
      appearance: none;
      border: 2px solid transparent;
      background: transparent;
      font-size: 36px;
      line-height: 1;
      padding: 4px;
      cursor: pointer;
      opacity: 0.5;
      transition: transform 150ms ease, opacity 150ms ease;
    }

    .fw-emoji-option[aria-checked="true"] {
      opacity: 1;
      transform: scale(1.2);
      border-color: ${config.primaryColor};
      border-radius: 8px;
    }

    .fw-emoji-option:focus-visible {
      outline: 2px solid ${config.primaryColor};
      outline-offset: 2px;
    }

    .fw-validation-error {
      color: #ef4444;
      font-size: 12px;
      margin: 0;
    }

    .fw-validation-error[hidden] {
      display: none;
    }

    .fw-comment {
      width: 100%;
      min-height: 80px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 14px;
      resize: vertical;
      box-sizing: border-box;
    }

    .fw-comment:focus-visible {
      outline: 2px solid ${config.primaryColor};
      outline-offset: 0;
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

    .fw-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .fw-submit:not(:disabled):hover {
      background-color: ${config.accentColor};
    }

    .fw-submit:focus-visible {
      outline: 2px solid ${config.primaryColor};
      outline-offset: 2px;
    }
  `.trim();
}

function updateCharCounter(counter: HTMLElement, length: number): void {
  counter.textContent = `${length}/${MAX_COMMENT_LENGTH}`;
}

export function createFeedbackForm(
  config: WidgetConfig,
  onSubmit?: (payload: FeedbackFormPayload) => void,
): FeedbackFormController {
  const root = document.createElement("div");
  root.className = "fw-feedback-form";

  const style = document.createElement("style");
  style.textContent = buildFeedbackFormStyles(config);
  root.appendChild(style);

  const radiogroup = document.createElement("div");
  radiogroup.className = "fw-emoji-scale";
  radiogroup.setAttribute("role", "radiogroup");
  radiogroup.setAttribute("aria-label", RADIOGROUP_LABEL);

  const validationError = document.createElement("p");
  validationError.className = "fw-validation-error";
  validationError.textContent = VALIDATION_ERROR_MESSAGE;
  validationError.hidden = true;

  const comment = document.createElement("textarea");
  comment.className = "fw-comment";
  comment.placeholder = COMMENT_PLACEHOLDER;
  comment.maxLength = MAX_COMMENT_LENGTH;

  const charCounter = document.createElement("span");
  charCounter.className = "fw-char-counter";
  updateCharCounter(charCounter, 0);

  const submitButton = document.createElement("button");
  submitButton.type = "button";
  submitButton.className = "fw-submit";
  submitButton.textContent = SUBMIT_LABEL;
  submitButton.disabled = true;

  const emojiButtons: HTMLButtonElement[] = [];
  let selectedRating: FeedbackRating | null = null;

  function updateEmojiState(): void {
    for (let i = 0; i < emojiButtons.length; i++) {
      const button = emojiButtons[i];
      const option = EMOJI_SCALE[i];
      if (!button || !option) {
        continue;
      }
      const isSelected = option.rating === selectedRating;
      button.setAttribute("aria-checked", String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
    }
    submitButton.disabled = selectedRating === null;
  }

  function selectRating(rating: FeedbackRating): void {
    selectedRating = rating;
    validationError.hidden = true;
    updateEmojiState();
  }

  function buildPayload(): FeedbackFormPayload | null {
    if (selectedRating === null) {
      return null;
    }
    const option = EMOJI_SCALE.find((item) => item.rating === selectedRating);
    if (!option) {
      return null;
    }
    return {
      rating: selectedRating,
      ratingEmoji: option.emoji,
      comment: comment.value,
      formType: "feedback",
    };
  }

  function submit(): boolean {
    const payload = buildPayload();
    if (!payload) {
      validationError.hidden = false;
      playValidationErrorFx(config, radiogroup);
      return false;
    }
    onSubmit?.(payload);
    return true;
  }

  function reset(): void {
    selectedRating = null;
    comment.value = "";
    validationError.hidden = true;
    updateCharCounter(charCounter, 0);
    updateEmojiState();
    const firstEmoji = emojiButtons[0];
    if (firstEmoji) {
      firstEmoji.focus();
    }
  }

  for (let i = 0; i < EMOJI_SCALE.length; i++) {
    const option = EMOJI_SCALE[i];
    if (!option) {
      continue;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "fw-emoji-option";
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", "false");
    button.setAttribute("aria-label", option.label);
    button.textContent = option.emoji;
    button.tabIndex = i === 0 ? 0 : -1;

    button.addEventListener("click", () => {
      selectRating(option.rating);
    });

    button.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        selectRating(option.rating);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        const nextIndex = (i + 1) % EMOJI_SCALE.length;
        const nextButton = emojiButtons[nextIndex];
        if (nextButton) {
          nextButton.focus();
          const nextOption = EMOJI_SCALE[nextIndex];
          if (nextOption) {
            selectRating(nextOption.rating);
          }
        }
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        const prevIndex = (i - 1 + EMOJI_SCALE.length) % EMOJI_SCALE.length;
        const prevButton = emojiButtons[prevIndex];
        if (prevButton) {
          prevButton.focus();
          const prevOption = EMOJI_SCALE[prevIndex];
          if (prevOption) {
            selectRating(prevOption.rating);
          }
        }
      }
    });

    emojiButtons.push(button);
    radiogroup.appendChild(button);
  }

  comment.addEventListener("input", () => {
    if (comment.value.length > MAX_COMMENT_LENGTH) {
      comment.value = comment.value.slice(0, MAX_COMMENT_LENGTH);
    }
    updateCharCounter(charCounter, comment.value.length);
  });

  submitButton.addEventListener("click", () => {
    submit();
  });

  root.appendChild(radiogroup);
  root.appendChild(validationError);
  root.appendChild(comment);
  root.appendChild(charCounter);
  root.appendChild(submitButton);

  updateEmojiState();

  return {
    root,
    getSelectedRating: () => selectedRating,
    getPayload: buildPayload,
    submit,
    reset,
  };
}
