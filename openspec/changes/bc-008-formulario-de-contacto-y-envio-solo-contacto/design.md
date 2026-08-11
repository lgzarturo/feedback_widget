# Design: Formulario de contacto y envio solo-contacto

**Status:** Aprobado — listo para fase test.

## Approach

Modulo `contact-form.ts` que crea un componente DOM autocontenido (sin Shadow DOM propio) con campos name, email y message, validacion inline en blur y submit, y boton de envio. Expone `createContactForm(config, onSubmit?)` que retorna un controller con `root`, `getPayload()` y `submit()`. No depende de `feedback-form.ts`. Se montara dentro del tabpanel Contacto del modal (BC-006) en un item de integracion posterior.

## API publica

```typescript
export interface ContactFormPayload {
  name: string;
  email: string;
  message: string;
  formType: "contact";
}

export interface ContactFormController {
  root: HTMLElement;
  getPayload(): ContactFormPayload | null;
  submit(): boolean;
}

export function createContactForm(
  config: WidgetConfig,
  onSubmit?: (payload: ContactFormPayload) => void,
): ContactFormController;
```

## Estructura DOM

```
.fw-contact-form
├── <style> (estilos scoped al root)
├── label[for="fw-contact-name"] + input#fw-contact-name.fw-field-input
│   └── .fw-field-error[hidden] → "El nombre es obligatorio"
├── label[for="fw-contact-email"] + input#fw-contact-email.fw-field-input[type="email"]
│   └── .fw-field-error[hidden] → "El email es obligatorio" / "Ingresa un email valido"
├── label[for="fw-contact-message"] + textarea#fw-contact-message.fw-field-input
│   ├── .fw-char-counter → "0/1000"
│   └── .fw-field-error[hidden] → "El mensaje es obligatorio"
└── button.fw-submit[type="button"] → "Enviar mensaje"
```

## Reglas de validacion y envio

1. **Nombre requerido:** trim vacio → error inline "El nombre es obligatorio".
2. **Email requerido:** trim vacio → "El email es obligatorio".
3. **Email formato:** regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` falla → "Ingresa un email valido".
4. **Mensaje requerido:** trim vacio → "El mensaje es obligatorio"; max 1000 caracteres con counter.
5. **Validacion en blur y submit:** cada campo valida en blur; submit valida todos.
6. **Payload:** si validacion pasa, incluye `name`, `email`, `message` (trimmed) y `formType: "contact"`.
7. **submit():** retorna `false` y no invoca `onSubmit` si validacion falla; retorna `true` e invoca callback si pasa.
8. **Estilos:** funcion local `buildContactFormStyles(config)` inyectada en `<style>` hijo del root; sin contaminar `document.head`.
9. **Accesibilidad:** labels con `for` vinculados a inputs; errores con `aria-describedby` y `role="alert"`.

## Flujo solo-contacto

1. `createContactForm` no importa ni depende de `feedback-form.ts`.
2. El payload solo contiene `{ name, email, message, formType: "contact" }` — sin `rating` ni `ratingEmoji`.
3. El test de integracion ligera monta `createTabs(DEFAULT_TABS, "contact")`, inserta el form en el panel Contacto y envia sin activar el tab Feedback.

## Estilos minimos

| Elemento | Regla |
|----------|-------|
| Form layout | flexbox column, gap 12px |
| Input/textarea | border 1px `#d1d5db`, border-radius 8px, padding 10px 12px |
| Input focus | outline 2px `primaryColor` |
| Input error | border 2px `#ef4444` |
| Error text | color `#ef4444`, 12px, debajo del campo |
| Submit | ancho 100%, background `primaryColor`, hover `accentColor` |

## Files Affected

| Archivo | Accion |
|---------|--------|
| `src/ui/contact-form.ts` | crear |
| `tests/ui/contact-form.test.ts` | crear |

## Acceptance Criteria

- [x] El formulario muestra campos name, email y message con labels accesibles
- [x] Validacion inline rechaza email invalido y campos vacios antes del envio
- [x] El usuario puede enviar contacto desde el tab Contacto sin interactuar con el tab Feedback
- [x] El payload preparado incluye metadata con formType contact
- [x] Tests verifican validacion de email, campos requeridos y payload de contacto

## Out of scope

Cliente HTTP (`src/api/`), animaciones Three.js (BC-009), montaje en `modal.ts` / `bootstrap.ts`, status bar post-envio
