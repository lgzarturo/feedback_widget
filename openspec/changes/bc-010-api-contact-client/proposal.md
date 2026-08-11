# Proposal: Cliente API api.appsutiles.dev

## Why

Implementar el cliente HTTP asincrono que envia mensajes de feedback y contacto a `POST /v1/contact/messages` de api.appsutiles.dev con headers `x-api-key` y mapeo de metadata.

**Business value:** entrega confiable de feedback y contacto al backend centralizado de AppsUtiles

## What Changes

- `src/api/contact-client.ts` — `buildContactMessageBody` y `sendContactMessage` con manejo de errores HTTP
- `tests/api/contact-client.test.ts` — tests con fetch mockeado (exito 201, 401, 400, 5xx)

## Capabilities

- **New Capabilities:** `contact-client`
- **Modified Capabilities:** ninguno (integracion en modal/status bar en item posterior)

## Convenciones de manejo de errores HTTP

| Status | Mensaje al usuario |
|--------|-------------------|
| 201 | exito (`{ ok: true }`) |
| 401 | "API key invalida" |
| 400 | "Error de validacion" |
| 5xx | "Error del servidor. Intenta de nuevo." |

## Files Affected

| Archivo | Accion |
|---------|--------|
| `src/api/contact-client.ts` | crear |
| `tests/api/contact-client.test.ts` | crear |

## Impact

Riesgos: exposicion de API key en atributo HTML del sitio host; documentar buenas practicas en design.md.

**Out of scope:** panel admin de mensajes, rate limiting del lado cliente, almacenamiento local de borradores, integracion UI/status bar, montaje en modal/bootstrap
