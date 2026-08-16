import { describe, expect, test } from "bun:test";
import { buildContactMessageBody, sendContactMessage } from "../../src/api/contact-client";
import { DEFAULT_WIDGET_CONFIG } from "../../src/config/parse";
import type { WidgetConfig } from "../../src/config/types";
import type { ContactFormPayload } from "../../src/ui/contact-form";
import type { FeedbackFormPayload } from "../../src/ui/feedback-form";

const FIXED_NOW = new Date("2026-08-10T12:00:00.000Z");

function configWith(overrides: Partial<WidgetConfig> = {}): WidgetConfig {
  return { ...DEFAULT_WIDGET_CONFIG, ...overrides };
}

function contactPayload(overrides: Partial<ContactFormPayload> = {}): ContactFormPayload {
  return {
    name: "Juan Perez",
    email: "juan@example.com",
    message: "Hola, necesito ayuda",
    formType: "contact",
    ...overrides,
  };
}

function feedbackPayload(overrides: Partial<FeedbackFormPayload> = {}): FeedbackFormPayload {
  return {
    rating: 4,
    ratingEmoji: "🙂",
    comment: "Muy buena experiencia",
    formType: "feedback",
    ...overrides,
  };
}

interface CapturedRequest {
  url: string;
  init: RequestInit;
}

function mockFetch(
  status: number,
  options: { ok?: boolean; body?: unknown } = {},
): { fetchFn: typeof fetch; captured: CapturedRequest } {
  const captured: CapturedRequest = { url: "", init: {} };
  const fetchFn = (async (url: string | URL | Request, init?: RequestInit) => {
    captured.url = String(url);
    captured.init = init ?? {};
    if (options.body !== undefined) {
      return new Response(JSON.stringify(options.body), {
        status,
        statusText: String(status),
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(null, {
      status,
      statusText: String(status),
    });
  }) as typeof fetch;
  return { fetchFn, captured };
}

describe("BC-010 buildContactMessageBody", () => {
  test("given_feedback_without_comment_when_build_body_then_message_empty_and_no_metadata_comment", () => {
    const body = buildContactMessageBody(
      configWith({ locale: "es", source: "mi-sitio" }),
      feedbackPayload({ comment: "" }),
      () => FIXED_NOW,
    );

    expect(body.name).toBe("User Feedback");
    expect(body.email).toBe("lgzarturo@gmail.com");
    expect(body.message).toBe("");
    expect(body.locale).toBe("es");
    expect(body.source).toBe("mi-sitio");
    expect(body.submittedAt).toBe("2026-08-10T12:00:00.000Z");
    expect(body.metadata).toEqual({
      formType: "feedback",
      rating: 4,
      ratingEmoji: "🙂",
    });
    expect("comment" in body.metadata).toBe(false);
  });

  test("given_contact_payload_when_build_body_then_includes_top_level_fields_and_contact_metadata", () => {
    const body = buildContactMessageBody(
      configWith({ locale: "en", source: "blog" }),
      contactPayload(),
      () => FIXED_NOW,
    );

    expect(body).toEqual({
      name: "Juan Perez",
      email: "juan@example.com",
      message: "Hola, necesito ayuda",
      locale: "en",
      source: "blog",
      submittedAt: "2026-08-10T12:00:00.000Z",
      metadata: { formType: "contact" },
    });
  });
});

describe("BC-010 sendContactMessage", () => {
  test("given_contact_payload_when_send_then_posts_with_headers_and_body", async () => {
    const { fetchFn, captured } = mockFetch(201, { ok: true });
    const config = configWith({ apiKey: "test-key-123", baseUrl: "https://api.appsutiles.dev" });

    await sendContactMessage(config, contactPayload(), {
      fetchFn,
      now: () => FIXED_NOW,
    });

    expect(captured.url).toBe("https://api.appsutiles.dev/v1/contact/messages");
    expect(captured.init.method).toBe("POST");
    const headers = captured.init.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
    expect(headers["x-api-key"]).toBe("test-key-123");

    const body = JSON.parse(String(captured.init.body));
    expect(body.name).toBe("Juan Perez");
    expect(body.email).toBe("juan@example.com");
    expect(body.message).toBe("Hola, necesito ayuda");
    expect(body.locale).toBe("es");
    expect(body.source).toBe("");
    expect(body.submittedAt).toBe("2026-08-10T12:00:00.000Z");
    expect(body.metadata).toEqual({ formType: "contact" });
  });

  test("given_feedback_payload_when_send_then_maps_metadata_with_rating_and_comment", async () => {
    const { fetchFn, captured } = mockFetch(201, { ok: true });

    await sendContactMessage(configWith(), feedbackPayload(), {
      fetchFn,
      now: () => FIXED_NOW,
    });

    const body = JSON.parse(String(captured.init.body));
    expect(body.name).toBe("User Feedback");
    expect(body.email).toBe("lgzarturo@gmail.com");
    expect(body.message).toBe("Muy buena experiencia");
    expect(body.metadata).toEqual({
      formType: "feedback",
      rating: 4,
      ratingEmoji: "🙂",
      comment: "Muy buena experiencia",
    });
  });

  test("given_base_url_with_trailing_slash_when_send_then_url_normalized", async () => {
    const { fetchFn, captured } = mockFetch(201, { ok: true });

    await sendContactMessage(
      configWith({ baseUrl: "https://api.appsutiles.dev/" }),
      contactPayload(),
      { fetchFn, now: () => FIXED_NOW },
    );

    expect(captured.url).toBe("https://api.appsutiles.dev/v1/contact/messages");
  });

  test("given_api_returns_201_when_send_then_ok_true", async () => {
    const { fetchFn } = mockFetch(201, { ok: true });

    const result = await sendContactMessage(configWith(), contactPayload(), {
      fetchFn,
      now: () => FIXED_NOW,
    });

    expect(result).toEqual({ ok: true });
  });

  test("given_api_returns_401_when_send_then_user_message_invalid_api_key", async () => {
    const { fetchFn } = mockFetch(401);

    const result = await sendContactMessage(configWith(), contactPayload(), {
      fetchFn,
      now: () => FIXED_NOW,
    });

    expect(result).toEqual({
      ok: false,
      status: 401,
      userMessage: "API key inválida",
    });
  });

  test("given_api_returns_400_without_body_when_send_then_user_message_validation_error", async () => {
    const { fetchFn } = mockFetch(400);

    const result = await sendContactMessage(configWith(), contactPayload(), {
      fetchFn,
      now: () => FIXED_NOW,
    });

    expect(result).toEqual({
      ok: false,
      status: 400,
      userMessage: "Error de validación",
    });
  });

  test("given_api_returns_400_with_error_message_when_send_then_extracts_error_message", async () => {
    const zodMessage = JSON.stringify([
      {
        origin: "string",
        code: "too_small",
        minimum: 1,
        inclusive: true,
        path: ["name"],
        message: "Too small: expected string to have >=1 characters",
      },
      {
        origin: "string",
        code: "invalid_format",
        format: "email",
        path: ["email"],
        message: "Invalid email address",
      },
    ]);
    const { fetchFn } = mockFetch(400, {
      body: {
        success: false,
        error: {
          name: "ZodError",
          message: zodMessage,
        },
      },
    });

    const result = await sendContactMessage(configWith(), contactPayload(), {
      fetchFn,
      now: () => FIXED_NOW,
    });

    expect(result).toEqual({
      ok: false,
      status: 400,
      userMessage: "Too small: expected string to have >=1 characters. Invalid email address",
    });
  });

  test("given_api_returns_400_with_plain_error_message_when_send_then_uses_error_message", async () => {
    const { fetchFn } = mockFetch(400, {
      body: {
        success: false,
        error: {
          name: "ValidationError",
          message: "El campo message es obligatorio",
        },
      },
    });

    const result = await sendContactMessage(configWith(), contactPayload(), {
      fetchFn,
      now: () => FIXED_NOW,
    });

    expect(result).toEqual({
      ok: false,
      status: 400,
      userMessage: "El campo message es obligatorio",
    });
  });

  test("given_api_returns_500_when_send_then_user_message_server_retry", async () => {
    const { fetchFn } = mockFetch(500);

    const result = await sendContactMessage(configWith(), contactPayload(), {
      fetchFn,
      now: () => FIXED_NOW,
    });

    expect(result).toEqual({
      ok: false,
      status: 500,
      userMessage: "Error del servidor. Intenta de nuevo.",
    });
  });

  test("given_api_returns_unmapped_status_when_send_then_user_message_server_retry", async () => {
    const { fetchFn } = mockFetch(403);

    const result = await sendContactMessage(configWith(), contactPayload(), {
      fetchFn,
      now: () => FIXED_NOW,
    });

    expect(result).toEqual({
      ok: false,
      status: 403,
      userMessage: "Error del servidor. Intenta de nuevo.",
    });
  });

  test("given_fetch_throws_when_send_then_returns_network_error_result", async () => {
    const fetchFn = (async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;

    const result = await sendContactMessage(configWith(), contactPayload(), {
      fetchFn,
      now: () => FIXED_NOW,
    });

    expect(result).toEqual({
      ok: false,
      status: 0,
      userMessage: "No se pudo conectar con el servidor. Intenta de nuevo.",
    });
  });
});
