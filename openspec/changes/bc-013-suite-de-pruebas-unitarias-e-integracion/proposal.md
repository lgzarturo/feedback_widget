# Proposal: Suite de pruebas unitarias e integración

**Status:** Aprobado — listo para fase test.

## Why

Consolidar la suite de pruebas unitarias e integración que cubre parser de configuración, formularios, cliente API y flujo completo de envío con fetch mockeado.

**Business value:** regresión automática que garantiza calidad antes de cada release CDN.

## Inventario de tests existentes

| Módulo | Archivo | Estado | Cobertura |
|--------|---------|--------|-----------|
| Config | `tests/config/parse.test.ts` | ✅ 8 tests — defaults, atributos completos, posiciones válidas/aliases/inválidas, colores inválidos, animation/z-index inválidos | `parse.ts` 100% |
| API | `tests/api/contact-client.test.ts` | ✅ 9 tests — build body feedback/contact, send con headers, mapeo metadata, URL normalizada, errores 401/400/500 | `contact-client.ts` 94% |
| UI modal | `tests/ui/modal.test.ts` | ✅ 6 tests — open/close, escape, focus trap, trigger wiring | parcial |
| UI tabs | `tests/ui/tabs.test.ts` | ✅ 5 tests — navegación teclado, aria-selected | parcial |
| UI feedback | `tests/ui/feedback-form.test.ts` | ✅ 8 tests — emojis, validación, payload, counter | parcial |
| UI contact | `tests/ui/contact-form.test.ts` | ✅ 8 tests — validación, payload, flujo contact tab aislado | parcial |
| UI trigger | `tests/ui/trigger-button.test.ts` | ✅ 15 tests — posiciones, z-index, accesibilidad | 100% |
| Bootstrap | `tests/bootstrap.test.ts` | ✅ 11 tests — init, idempotencia, montaje trigger/modal/forms | parcial |
| Animations | `tests/animations/*.test.ts` | ✅ modal-scene + validation-fx | parcial |
| Build | `tests/build/build.test.ts` | ✅ pipeline bundle | N/A |
| Playground | `tests/playground/playground.test.ts` | ✅ archivos estáticos | N/A |

**Cobertura baseline:** 93.23% líneas (≥80% requerido).

## Tests faltantes (gaps)

| Gap | Acción |
|-----|--------|
| `tests/integration/widget-flow.test.ts` | **Crear** — flujo end-to-end widget: trigger → modal → emoji → envío API |
| Integración solo-contacto | **Crear** — tab Contacto sin interacción con Feedback |
| Config casos edge adicionales | Opcional — base URL vacía, locale con espacios (si mejora cobertura) |

## Convenciones de mocks y helpers DOM

- **Happy-DOM:** preload vía `tests/setup.ts` / `bunfig.toml`
- **Helpers host:** `hostWith(attrs)` — crea `[data-feedback]` con atributos
- **Shadow DOM:** consultar `host.shadowRoot?.querySelector(...)` para trigger y modal
- **Fetch mock:** reemplazar `globalThis.fetch` en beforeEach/afterEach; capturar URL, headers y body JSON
- **Async envío:** `sendContactMessage` es fire-and-forget desde modal — usar `await flushMicrotasks()` tras submit
- **Naming:** `given_<precondición>_when_<acción>_then_<resultado>`
- **describe:** `describe("BC-013 widget-flow", () => { ... })`

## What Changes

- `tests/integration/widget-flow.test.ts` — **nuevo**
- `openspec/changes/bc-013-suite-de-pruebas-unitarias-e-integracion/` — proposal, design, tasks completados
- `BACKLOG.md` — BC-013 Status → DONE

## Out of scope

Pruebas E2E con navegador real, pruebas de carga, pruebas contra API de producción.
