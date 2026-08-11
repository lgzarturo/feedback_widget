# Proposal: Cliente API api.appsutiles.dev

## Why

Implementar el cliente HTTP asincrono que envia mensajes a POST /v1/contact/messages de api.appsutiles.dev con headers x-api-key y mapeo de metadata para feedback y contacto.

**Business value:** entrega confiable de feedback y contacto al backend centralizado de AppsUtiles

## What Changes

- src/api/contact-client.ts, tests/api/contact-client.test.ts

## Capabilities

- **New Capabilities:** (to be refined in design phase)
- **Modified Capabilities:** (to be refined in design phase)

## Impact

Risks: exposicion de API key en atributo HTML del sitio host; documentar buenas practicas

**Out of scope:** panel admin de mensajes, rate limiting del lado cliente, almacenamiento local de borradores
