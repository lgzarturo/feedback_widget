# Design: Cliente API api.appsutiles.dev

**Status:** Aprobado — listo para fase test.

## Approach

Modulo `contact-client.ts` con funcion pura `buildContactMessageBody` para mapear payloads de formulario a request JSON, y `sendContactMessage` para POST asincrono con `fetch` inyectable en tests. Sin UI ni status bar — solo cliente HTTP y mensajes de error para el usuario.

## Endpoint

`POST {baseUrl}/v1/contact/messages`

- Normalizar `baseUrl` eliminando trailing slash antes de concatenar
- Headers: `Content-Type: application/json`, `x-api-key: {config.apiKey}`

## Contrato request

```typescript
interface ContactMessageRequest {
  name: string;
  email: string;
  message: string;
  locale: string;
  source: string;
  submittedAt: string; // ISO8601 UTC
  metadata: FeedbackMetadata | ContactMetadata;
}

interface FeedbackMetadata {
  formType: "feedback";
  rating: 1 | 2 | 3 | 4 | 5;
  ratingEmoji: string;
  comment?: string; // solo si comment !== ""
}

interface ContactMetadata {
  formType: "contact";
}
```

## Mapeo metadata feedback y contacto

| Origen | name | email | message | metadata |
|--------|------|-------|---------|----------|
| `ContactFormPayload` | payload.name | payload.email | payload.message | `{ formType: "contact" }` |
| `FeedbackFormPayload` | `""` | `""` | payload.comment | `{ formType: "feedback", rating, ratingEmoji, comment? }` |

Feedback es anonimo: no pide nombre ni email. El comentario opcional va en `message` (campo requerido por API) y en `metadata.comment` solo si no esta vacio.

Campos de config: `locale` y `source` desde `WidgetConfig`. `submittedAt` generado con `new Date().toISOString()` (inyectable en tests).

## API publica

```typescript
export type ContactMessageResult =
  | { ok: true }
  | { ok: false; status: number; userMessage: string };

export interface SendContactMessageDeps {
  fetchFn?: typeof fetch;
  now?: () => Date;
}

export function buildContactMessageBody(
  config: WidgetConfig,
  payload: ContactFormPayload | FeedbackFormPayload,
  now?: () => Date,
): ContactMessageRequest;

export async function sendContactMessage(
  config: WidgetConfig,
  payload: ContactFormPayload | FeedbackFormPayload,
  deps?: SendContactMessageDeps,
): Promise<ContactMessageResult>;
```

## Manejo de respuestas

| Status | Resultado |
|--------|-----------|
| 201 | `{ ok: true }` |
| 401 | `{ ok: false, status: 401, userMessage: "API key invalida" }` |
| 400 | `{ ok: false, status: 400, userMessage: "Error de validacion" }` |
| 500–599 | `{ ok: false, status, userMessage: "Error del servidor. Intenta de nuevo." }` |

Otros status no exitosos: tratar como error generico de servidor (mensaje 5xx).

## Seguridad

- API key solo en header `x-api-key`, nunca en query string ni body
- Riesgo documentado: `data-api-key` en HTML del host es visible en DevTools
- No loguear API key ni body completo en consola
- `baseUrl` proviene de config parseada en BC-003 (sin SSRF adicional)

## Files Affected

| Archivo | Accion |
|---------|--------|
| `src/api/contact-client.ts` | crear |
| `tests/api/contact-client.test.ts` | crear |

## Acceptance Criteria

- [x] POST a {baseUrl}/v1/contact/messages con Content-Type application/json y header x-api-key
- [x] El body incluye name, email, message, locale, source, submittedAt en ISO8601 y metadata
- [x] metadata de feedback incluye rating, ratingEmoji, formType feedback y comentario opcional
- [x] metadata de contacto incluye formType contact
- [x] Respuesta 401 muestra mensaje de error de API key invalida al usuario
- [x] Respuesta 400 muestra mensaje de error de validacion al usuario
- [x] Respuesta 5xx muestra mensaje generico de reintento al usuario
- [x] Tests con fetch mockeado cubren exito, 401, 400 y 5xx

## Out of scope

Integracion en modal/bootstrap, status bar post-envio, rate limiting, almacenamiento local
