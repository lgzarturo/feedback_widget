import type { WidgetConfig } from "../config/types";
import type { ContactFormPayload } from "../ui/contact-form";
import type { FeedbackFormPayload } from "../ui/feedback-form";

export type ContactMessageResult =
  | { ok: true }
  | { ok: false; status: number; userMessage: string };

export interface ContactMetadata {
  formType: "contact";
}

export interface FeedbackMetadata {
  formType: "feedback";
  rating: 1 | 2 | 3 | 4 | 5;
  ratingEmoji: string;
  comment?: string;
}

export interface ContactMessageRequest {
  name: string;
  email: string;
  message: string;
  locale: string;
  source: string;
  submittedAt: string;
  metadata: ContactMetadata | FeedbackMetadata;
}

export interface SendContactMessageDeps {
  fetchFn?: typeof fetch;
  now?: () => Date;
}

const ERROR_MESSAGES = {
  invalidApiKey: "API key inválida",
  validation: "Error de validación",
  server: "Error del servidor. Intenta de nuevo.",
  network: "No se pudo conectar con el servidor. Intenta de nuevo.",
} as const;

const FEEDBACK_DEFAULT_NAME = "User Feedback";
const FEEDBACK_DEFAULT_EMAIL = "lgzarturo@gmail.com";

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/$/, "");
}

function buildFeedbackMetadata(payload: FeedbackFormPayload): FeedbackMetadata {
  const metadata: FeedbackMetadata = {
    formType: "feedback",
    rating: payload.rating,
    ratingEmoji: payload.ratingEmoji,
  };
  if (payload.comment !== "") {
    metadata.comment = payload.comment;
  }
  return metadata;
}

export function buildContactMessageBody(
  config: WidgetConfig,
  payload: ContactFormPayload | FeedbackFormPayload,
  now: () => Date = () => new Date(),
): ContactMessageRequest {
  const submittedAt = now().toISOString();

  if (payload.formType === "contact") {
    return {
      name: payload.name,
      email: payload.email,
      message: payload.message,
      locale: config.locale,
      source: config.source,
      submittedAt,
      metadata: { formType: "contact" },
    };
  }

  return {
    name: FEEDBACK_DEFAULT_NAME,
    email: FEEDBACK_DEFAULT_EMAIL,
    message: payload.comment,
    locale: config.locale,
    source: config.source,
    submittedAt,
    metadata: buildFeedbackMetadata(payload),
  };
}

function formatApiErrorMessage(message: string): string {
  try {
    const parsed: unknown = JSON.parse(message);
    if (Array.isArray(parsed)) {
      const parts: string[] = [];
      for (const item of parsed) {
        if (
          typeof item === "object" &&
          item !== null &&
          "message" in item &&
          typeof (item as { message: unknown }).message === "string"
        ) {
          parts.push((item as { message: string }).message);
        }
      }
      if (parts.length > 0) {
        return parts.join(". ");
      }
    }
  } catch {
    // El mensaje no es JSON; se usa tal cual.
  }
  return message;
}

function extractErrorMessage(data: unknown): string | null {
  if (typeof data !== "object" || data === null || !("error" in data)) {
    return null;
  }
  const error = (data as { error: unknown }).error;
  if (typeof error !== "object" || error === null || !("message" in error)) {
    return null;
  }
  const message = (error as { message: unknown }).message;
  if (typeof message !== "string" || message.trim() === "") {
    return null;
  }
  return formatApiErrorMessage(message);
}

async function mapErrorResult(response: Response): Promise<ContactMessageResult> {
  const status = response.status;

  if (status === 401) {
    return {
      ok: false,
      status,
      userMessage: ERROR_MESSAGES.invalidApiKey,
    };
  }

  if (status === 400) {
    let userMessage: string = ERROR_MESSAGES.validation;
    try {
      const data: unknown = await response.json();
      const extracted = extractErrorMessage(data);
      if (extracted !== null) {
        userMessage = extracted;
      }
    } catch {
      // Sin body parseable; se mantiene el mensaje genérico.
    }
    return {
      ok: false,
      status,
      userMessage,
    };
  }

  if (status >= 500 && status <= 599) {
    return {
      ok: false,
      status,
      userMessage: ERROR_MESSAGES.server,
    };
  }

  return {
    ok: false,
    status,
    userMessage: ERROR_MESSAGES.server,
  };
}

export async function sendContactMessage(
  config: WidgetConfig,
  payload: ContactFormPayload | FeedbackFormPayload,
  deps: SendContactMessageDeps = {},
): Promise<ContactMessageResult> {
  const fetchFn = deps.fetchFn ?? globalThis.fetch;
  const body = buildContactMessageBody(config, payload, deps.now);
  const url = `${normalizeBaseUrl(config.baseUrl)}/v1/contact/messages`;

  try {
    const response = await fetchFn(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (response.status === 201) {
      return { ok: true };
    }

    return mapErrorResult(response);
  } catch {
    return {
      ok: false,
      status: 0,
      userMessage: ERROR_MESSAGES.network,
    };
  }
}
