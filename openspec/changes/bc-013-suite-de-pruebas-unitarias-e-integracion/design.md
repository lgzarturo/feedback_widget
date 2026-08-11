# Design: Suite de pruebas unitarias e integración

**Status:** Aprobado — listo para fase test.

## Approach

Consolidar cobertura existente y cerrar el gap principal con un archivo de integración que ejercita el widget montado vía `initFeedbackWidget` (bootstrap completo BC-011). Los tests unitarios por módulo ya existen; BC-013 agrega el puente entre bootstrap, modal, formularios y cliente API con fetch mockeado a nivel global.

## Plan de cobertura por módulo

| Módulo | Archivo test | Escenarios clave | Meta |
|--------|--------------|------------------|------|
| `src/config/parse.ts` | `tests/config/parse.test.ts` | defaults, attrs válidos, posición/colores/animation/z-index inválidos | Mantener 100% |
| `src/api/contact-client.ts` | `tests/api/contact-client.test.ts` | build body feedback/contact, POST headers, errores HTTP | Mantener ≥90% |
| `src/ui/feedback-form.ts` | `tests/ui/feedback-form.test.ts` | emojis, validación, payload | Mantener ≥79% |
| `src/ui/contact-form.ts` | `tests/ui/contact-form.test.ts` | campos, validación email, payload contact | Mantener ≥98% |
| `src/ui/modal.ts` | `tests/ui/modal.test.ts` + integración | open/close + mount forms | Mejorar vía integración |
| `src/bootstrap.ts` | `tests/bootstrap.test.ts` + integración | init + envío | Mejorar vía integración |
| **Integración** | `tests/integration/widget-flow.test.ts` | flujos completos con fetch mock | **Nuevo** |

## Escenarios de integración

### Escenario A — Feedback completo

```
initFeedbackWidget(host con api-key)
  → click trigger (shadow)
  → modal.open() visible
  → click emoji rating 4 (🙂)
  → escribir comentario opcional
  → click "Enviar feedback"
  → fetch POST /v1/contact/messages
  → body.metadata.formType === "feedback"
  → body.metadata.rating === 4
  → body.message === comentario
```

**Assertions:**
- Modal abierto antes de submit
- Submit button habilitado tras seleccionar emoji
- Fetch capturado con headers `x-api-key` y `Content-Type: application/json`
- Payload JSON con metadata feedback

### Escenario B — Solo contacto (sin tab feedback)

```
initFeedbackWidget(host con api-key)
  → click trigger
  → click tab "Contacto" (sin interactuar con emojis ni panel feedback)
  → llenar name, email, message
  → click "Enviar mensaje"
  → fetch POST con metadata.formType === "contact"
  → sin rating ni ratingEmoji en metadata
```

**Assertions:**
- Tab activo sigue siendo "contact" tras envío
- Ningún emoji con `aria-checked="true"` en panel feedback
- Fetch body incluye name, email, message top-level
- metadata solo `{ formType: "contact" }`

### Escenario C — Error API (opcional, refuerzo)

```
initFeedbackWidget → feedback submit → fetch retorna 401
```

Cubierto en unit tests API; integración no duplica si cobertura ≥80%.

## Helpers compartidos (widget-flow.test.ts)

| Helper | Propósito |
|--------|-----------|
| `hostWith(attrs)` | Crear host `[data-feedback]` |
| `resetDom()` | Limpiar `document.body` |
| `getTriggerButton(triggerHost)` | Botón en shadow del trigger |
| `getModalShadow(modalHost)` | Acceso al shadow root del modal |
| `getFeedbackPanel(modalHost)` | `#fw-panel-feedback` |
| `getContactPanel(modalHost)` | `#fw-panel-contact` |
| `mockGlobalFetch(status)` | Mock + captura request; restore en afterEach |
| `flushMicrotasks()` | Esperar promesas de `sendContactMessage` |

## Files Affected

| Archivo | Acción |
|---------|--------|
| `tests/integration/widget-flow.test.ts` | crear |
| `openspec/changes/bc-013-suite-de-pruebas-unitarias-e-integracion/proposal.md` | completar |
| `openspec/changes/bc-013-suite-de-pruebas-unitarias-e-integracion/design.md` | completar |
| `openspec/changes/bc-013-suite-de-pruebas-unitarias-e-integracion/tasks.md` | completar |
| `BACKLOG.md` | BC-013 → DONE |

## Acceptance Criteria

- [x] `bun test` ejecuta todos los tests sin fallos
- [x] `tests/config` cubre parser con casos válidos e inválidos
- [x] `tests/api` cubre mapeo payload feedback y contacto con fetch mockeado
- [x] `tests/integration/widget-flow.test.ts` verifica flujo abrir modal, seleccionar emoji y preparar envío
- [x] `tests/integration/widget-flow.test.ts` verifica flujo solo-contacto sin tab feedback
- [x] Cobertura de líneas ≥80% según `bun test --coverage`

## Out of scope

E2E navegador real, load tests, API producción, cambios en código fuente salvo fixes mínimos para pasar tests.
