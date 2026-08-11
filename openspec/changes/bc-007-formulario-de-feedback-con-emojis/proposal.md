# Proposal: Formulario de feedback con emojis

## Why

Implementar el formulario de evaluacion de experiencia con escala de emojis de cinco niveles, comentario opcional y envio en un solo clic para facilitar el feedback rapido.

**Business value:** captura de satisfaccion con minima friccion para el usuario final

## What Changes

- `src/ui/feedback-form.ts` — factory `createFeedbackForm` con escala de emojis, comentario opcional y preparacion de payload
- `tests/ui/feedback-form.test.ts` — tests de seleccion, envio minimo, payload y validacion

## Capabilities

- **New Capabilities:** `feedback-form`
- **Modified Capabilities:** ninguno (montaje en modal se integrara en item posterior)

## Convenciones de metadata de satisfaccion

```typescript
{
  rating: 1 | 2 | 3 | 4 | 5,
  ratingEmoji: "😠" | "😕" | "😐" | "🙂" | "😍",
  comment: string,       // opcional, puede ser ""
  formType: "feedback"
}
```

| Rating | Emoji | Label a11y |
|--------|-------|------------|
| 1 | 😠 | Muy insatisfecho |
| 2 | 😕 | Insatisfecho |
| 3 | 😐 | Neutral |
| 4 | 🙂 | Satisfecho |
| 5 | 😍 | Muy satisfecho |

## Files Affected

| Archivo | Accion |
|---------|--------|
| `src/ui/feedback-form.ts` | crear |
| `tests/ui/feedback-form.test.ts` | crear |

## Impact

Riesgos: interpretacion subjetiva de emojis entre culturas; mitigar con `data-locale` en iteracion futura.

**Out of scope:** cliente API HTTP, animaciones Three.js, tab de contacto (BC-008), montaje en `modal.ts` / `bootstrap.ts`, status bar post-envio
