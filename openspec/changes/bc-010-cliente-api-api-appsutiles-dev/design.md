# Design: Cliente API api.appsutiles.dev

## Approach

(To be completed in design phase.)

## Files Affected

src/api/contact-client.ts, tests/api/contact-client.test.ts

## Acceptance Criteria

- POST a {baseUrl}/v1/contact/messages con Content-Type application/json y header x-api-key
- El body incluye name, email, message, locale, source, submittedAt en ISO8601 y metadata
- metadata de feedback incluye rating, ratingEmoji, formType feedback y comentario opcional
- metadata de contacto incluye formType contact
- Respuesta 401 muestra mensaje de error de API key invalida al usuario
- Respuesta 400 muestra mensaje de error de validacion al usuario
- Respuesta 5xx muestra mensaje generico de reintento al usuario
- Tests con fetch mockeado cubren exito, 401, 400 y 5xx
