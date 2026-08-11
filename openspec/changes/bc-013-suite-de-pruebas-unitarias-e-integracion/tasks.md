# Implementation Tasks — BC-013

## Fase discover + design

- [x] Ejecutar `npx cc-codeconductor openspec plan BC-013`
- [x] Completar `proposal.md` con inventario tests existentes/faltantes
- [x] Completar `design.md` con plan de cobertura y escenarios integración
- [x] Documentar convenciones mocks y helpers DOM

## Fase test (RED)

- [x] Crear `tests/integration/widget-flow.test.ts`
- [x] Test: flujo feedback — abrir modal, emoji, envío con fetch mock
- [x] Test: flujo solo-contacto — tab Contacto sin interacción Feedback
- [x] Verificar gaps en `tests/config` y `tests/api` (sin gaps — cobertura existente suficiente)

## Fase implement (GREEN)

- [x] Corregir código producción solo si tests fallan por lógica ausente (no requerido)
- [x] Agregar tests significativos si cobertura <80% (93.52% — no requerido)

## Fase validate

- [x] `bun run typecheck`
- [x] `bun run lint`
- [x] `bun test` — 106 pass, 0 fail
- [x] `bun test --coverage` — 93.52% líneas
- [x] `npx cc-codeconductor openspec validate`

## Fase backlog

- [x] Actualizar `BACKLOG.md`: BC-013 Status → DONE, Progress 100%
