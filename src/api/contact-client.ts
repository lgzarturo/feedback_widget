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
    name: "",
    email: "",
    message: payload.comment,
    locale: config.locale,
    source: config.source,
    submittedAt,
    metadata: buildFeedbackMetadata(payload),
  };
}

function mapErrorResult(status: number): ContactMessageResult {
  if (status === 401) {
    return {
      ok: false,
      status,
      userMessage: ERROR_MESSAGES.invalidApiKey,
    };
  }
  if (status === 400) {
    return {
      ok: false,
      status,
      userMessage: ERROR_MESSAGES.validation,
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

    return mapErrorResult(response.status);
  } catch {
    return {
      ok: false,
      status: 0,
      userMessage: ERROR_MESSAGES.network,
    };
  }
}
