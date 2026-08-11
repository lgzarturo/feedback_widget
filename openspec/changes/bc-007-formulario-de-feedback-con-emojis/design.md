# Design: Formulario de feedback con emojis

**Status:** Aprobado — listo para fase test.

## Approach

Modulo `feedback-form.ts` que crea un componente DOM autocontenido (sin Shadow DOM propio) con escala de 5 emojis, textarea opcional y boton de envio. Expone `createFeedbackForm(config, onSubmit?)` que retorna un controller con `root`, `getSelectedRating()`, `getPayload()` y `submit()`. Se montara dentro del tabpanel Feedback del modal (BC-006) en un item de integracion posterior.

## Escala de emojis

| Rating | Emoji | Label a11y |
|--------|-------|------------|
| 1 | 😠 | Muy insatisfecho |
| 2 | 😕 | Insatisfecho |
| 3 | 😐 | Neutral |
| 4 | 🙂 | Satisfecho |
| 5 | 😍 | Muy satisfecho |

## API publica

```typescript
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
}

export function createFeedbackForm(
  config: WidgetConfig,
  onSubmit?: (payload: FeedbackFormPayload) => void,
): FeedbackFormController;
```

## Estructura DOM

```
.fw-feedback-form
├── <style> (estilos scoped al root)
├── [role="radiogroup"][aria-label="¿Cómo fue tu experiencia?"]
│   └── button.fw-emoji-option × 5  [role="radio"][aria-checked]
├── .fw-validation-error[hidden]     → "Selecciona una opción"
├── textarea.fw-comment              → placeholder "¿Algo más que quieras compartir?", max 500
├── .fw-char-counter                 → "0/500"
└── button.fw-submit[type="button"]  → "Enviar feedback"
```

## Reglas de validacion y envio

1. **Emoji requerido:** sin rating → `submit()` retorna `false`, muestra error inline, `onSubmit` no se invoca.
2. **Boton deshabilitado** mientras no hay emoji seleccionado.
3. **Comentario opcional:** envio valido con emoji solo; `comment` puede ser `""`.
4. **Payload:** siempre incluye `rating`, `ratingEmoji`, `comment`, `formType: "feedback"`.
5. **Seleccion unica:** clic en emoji actualiza `aria-checked`, estilo selected (ring `config.primaryColor`), habilita submit.
6. **Estilos:** funcion local `buildFeedbackFormStyles(config)` inyectada en `<style>` hijo del root; sin contaminar `document.head`.
7. **Teclado:** flechas izq/der en radiogroup, Space/Enter para seleccionar (WAI-ARIA radiogroup).

## Estilos minimos

| Elemento | Regla |
|----------|-------|
| Emoji scale | flexbox, `justify-content: center`, gap 8px |
| Emoji no seleccionado | opacity 0.5 |
| Emoji seleccionado | ring 2px `primaryColor`, `transform: scale(1.2)` |
| Submit | ancho 100%, background `primaryColor`, disabled opacity 0.5 |
| Error | color `#ef4444`, 12px, debajo de la escala |

## Files Affected

| Archivo | Accion |
|---------|--------|
| `src/ui/feedback-form.ts` | crear |
| `tests/ui/feedback-form.test.ts` | crear |

## Acceptance Criteria

- [x] El formulario muestra cinco emojis seleccionables representando niveles de satisfaccion
- [x] El usuario puede enviar seleccionando solo un emoji sin escribir comentario
- [x] El payload preparado incluye metadata con rating numerico, ratingEmoji y formType feedback
- [x] Validacion inline impide envio sin emoji seleccionado mostrando mensaje de error
- [x] Tests verifican seleccion de emoji, envio minimo y rechazo sin seleccion

## Out of scope

Cliente HTTP (`src/api/`), tab de contacto (BC-008), animaciones Three.js (BC-009), montaje en `modal.ts` / `bootstrap.ts`, status bar post-envio
