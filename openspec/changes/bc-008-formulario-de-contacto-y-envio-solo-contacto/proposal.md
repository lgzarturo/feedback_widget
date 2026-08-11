# Proposal: Formulario de contacto y envio solo-contacto

## Why

Implementar el formulario de contacto con campos name, email y message, validacion inline y flujo independiente del tab de feedback para enviar solo un mensaje de contacto.

**Business value:** canal de contacto directo sin obligar al usuario a calificar su experiencia

## What Changes

- `src/ui/contact-form.ts` — factory `createContactForm` con campos name/email/message, validacion inline y preparacion de payload
- `tests/ui/contact-form.test.ts` — tests de validacion, envio exitoso, payload y flujo solo-contacto

## Capabilities

- **New Capabilities:** `contact-form`
- **Modified Capabilities:** ninguno (montaje en modal se integrara en item posterior)

## Convenciones de validacion de campos

```typescript
{
  name: string,      // trim, no vacio
  email: string,     // trim, formato email valido (regex basico)
  message: string,   // trim, no vacio, max 1000 caracteres
  formType: "contact"
}
```

| Campo | Regla | Mensaje de error |
|-------|-------|------------------|
| Nombre | trim no vacio | "El nombre es obligatorio" |
| Email vacio | trim no vacio | "El email es obligatorio" |
| Email invalido | regex basico | "Ingresa un email valido" |
| Mensaje | trim no vacio, max 1000 | "El mensaje es obligatorio" |

## Files Affected

| Archivo | Accion |
|---------|--------|
| `src/ui/contact-form.ts` | crear |
| `tests/ui/contact-form.test.ts` | crear |

## Impact

Riesgos: spam o abuso del formulario; mitigacion futura fuera de scope inicial.

**Out of scope:** cliente API HTTP, animaciones Three.js, formulario de feedback, montaje en `modal.ts` / `bootstrap.ts`
