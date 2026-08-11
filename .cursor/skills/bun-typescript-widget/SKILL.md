---
name: bun-typescript-widget
description: >-
  Stack Bun + TypeScript strict + Biome + bun test + happy-dom para el widget
  CDN de feedback. Usar al implementar, probar o validar código del widget.
---

# Feedback Widget — Bun + TypeScript

## Stack

| Capa | Herramienta |
|------|-------------|
| Runtime | Bun 1.x |
| Idioma | TypeScript `strict`, `ESNext` |
| Lint/format | Biome (`bun run lint`) |
| Tests | `bun test` + happy-dom preload |
| Spec gate | `npx cc-codeconductor openspec validate` |
| Build (BC-011) | `bun build` → IIFE `dist/feedback.min.js` |
| 3D (BC-009) | Three.js empaquetado en bundle |

## Comandos de validación

```bash
bun install
bun run typecheck    # tsc --noEmit
bun run lint         # biome check .
bun test             # suite con happy-dom
bun test --coverage  # cobertura (BC-013: ≥80%)
bun run validate     # openspec validate
```

## Estructura de carpetas

```
src/
  index.ts          # entry CDN
  config/           # parser data-feedback (BC-003)
  ui/               # trigger, modal, forms (BC-005–008)
  api/              # contact-client (BC-010)
  animations/       # Three.js (BC-009)
tests/
  setup.ts          # happy-dom GlobalRegistrator
  smoke.test.ts     # smoke toolchain
openspec/config.yaml
```

## TDD (BACKLOG Global)

1. **RED** — test que falla por lógica ausente, no por error de compilación
2. **GREEN** — implementación mínima
3. **REFACTOR** — limpiar con suite verde

Flujo OpenSpec: `npx cc-codeconductor openspec plan BC-xxx`

## Tests DOM

- `tests/setup.ts` registra happy-dom vía `bunfig.toml` preload
- Simular host: `document.createElement`, `data-feedback` attributes
- Mockear `fetch` para tests API (BC-010, BC-013)

## Integración CDN

```html
<script defer src="https://cdn.jsdelivr.net/gh/USUARIO/feedback_widget@VERSION/dist/feedback.min.js"></script>
<div data-feedback data-api-key="..." data-position="bottom-right"></div>
```

## Skills relacionadas

- `openspec` — BACKLOG y validación
- `testing-tdd` / `cc-tdd-cycle` — ciclo Red-Green-Refactor
- `security` — API key en HTML, headers x-api-key (BC-010)
- `cc-test-plan` — plan de pruebas antes de implementar
