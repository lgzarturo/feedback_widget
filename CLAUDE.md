# CLAUDE.md — Feedback Widget CDN

Instrucciones específicas para Claude (Claude Code, Cursor con Claude, Claude API)
al trabajar en este repositorio.

> Este archivo complementa `AGENTS.md` (reglas generales para todos los agentes).
> En caso de conflicto, `CLAUDE.md` prevalece para sesiones de Claude.

---

## Contexto del Proyecto

**Feedback Widget CDN** es un widget de feedback ligero y embebible vía CDN para
sitios web. Se integra mediante un tag HTML con atributos `data-feedback-*` y se
comunica con la API central de AppsÚtiles (`https://api.appsutiles.dev`).

### Stack

- **Runtime**: Bun 1.x
- **Lenguaje**: TypeScript strict (`ESNext`, `verbatimModuleSyntax`)
- **Lint/Format**: Biome (`bun run lint`)
- **Tests**: `bun test` + Happy-DOM preload
- **Spec gate**: `npx cc-codeconductor openspec validate`
- **Metodología**: Spec-Driven Development + TDD estricto (Red-Green-Refactor)

### Estado Actual

- ✅ BC-001: Scaffolding Bun + TypeScript strict
- ✅ BC-002: Toolchain de calidad (Biome, CI, OpenSpec)
- ✅ BC-003: Contrato de configuración `data-feedback-*`
- 🔲 BC-004+: Bootstrap, UI, formularios, API, animaciones, build

---

## Roles de Agente

Claude adopta diferentes roles según la fase del flujo. Las reglas de cada rol
son estrictas y no deben mezclarse.

### Tester

Adoptar en fase **RED** del ciclo TDD.

- Escribir tests ANTES de cualquier implementación
- Naming obligatorio: `given_<precondición>_when_<acción>_then_<resultado>`
- `describe` blocks con ID de backlog: `describe("BC-xxx nombreFunción", () => { ... })`
- Mínimo por función: 1 happy path, 1 edge case, 1 failure case
- El test debe fallar por lógica ausente, NO por error de compilación
- NO escribir código de implementación durante RED
- Verificar: test nuevo FAIL + tests existentes PASS

### Implementer

Adoptar en fases **GREEN** y **REFACTOR** del ciclo TDD.

- GREEN: escribir el código mínimo para pasar el test. Nada más
- REFACTOR: limpiar con suite verde. No agregar comportamiento nuevo
- Modificar SOLO archivos planificados en el Technical Plan
- Respetar estilo existente (Biome enforces)
- Ejecutar `bun test` después de cada cambio
- Producir Implementation Summary al finalizar

### Architect

Adoptar al diseñar soluciones técnicas.

- Producir Technical Plan con approach, tradeoffs, archivos afectados y riesgos
- NO escribir código de implementación
- El plan DEBE ser aprobado por el humano antes de continuar
- Considerar restricciones CDN: encapsulación, defer, idempotencia

### Reviewer

Adoptar al revisar código.

- Evaluar: correctness, arquitectura, seguridad, performance, cobertura de tests
- Producir Review Report con CRITICAL / WARNING / SUGGESTION
- CRITICAL bloquea merge — no aprobar con findings CRITICAL pendientes
- Verificar que no haya scope creep fuera del item del backlog

---

## Convenciones de Código

### TypeScript

```typescript
// ✅ Correcto
import type { WidgetConfig } from "./types";
export function parseFeedbackConfig(host: HTMLElement): WidgetConfig { ... }

// ❌ Incorrecto
import { WidgetConfig } from "./types";     // falta "type"
export default function parse() { ... }     // no export default
const config: any = {};                     // no "any"
enum Position { ... }                       // no enums, usar union types
```

### Estructura de Tests

```typescript
import { describe, expect, test } from "bun:test";

// Helper para crear elementos host con atributos
function hostWith(attrs: Record<string, string> = {}): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("data-feedback", "");
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, value);
  }
  return el;
}

describe("BC-xxx nombreFunción", () => {
  test("given_minimal_input_when_called_then_returns_defaults", () => {
    // arrange
    const host = hostWith();
    // act
    const result = parseFeedbackConfig(host);
    // assert
    expect(result).toEqual(DEFAULT_WIDGET_CONFIG);
  });
});
```

### Imports

- `import type { ... }` para tipos (enforced por `verbatimModuleSyntax`)
- Imports organizados por Biome automáticamente
- Paths relativos desde el archivo actual (`../../src/config/parse`)

---

## Flujo de Trabajo

### Para Features Nuevas (BC-xxx)

1. **Leer el item** en `BACKLOG.md` — entender scope, acceptance criteria y scorecard
2. **OpenSpec plan**: `npx cc-codeconductor openspec plan BC-xxx`
3. **Design** (architect): crear `design.md` en `openspec/changes/<slug>/`
4. **RED** (tester): escribir tests que fallen — `tests/<módulo>/<feature>.test.ts`
5. **GREEN** (implementer): implementación mínima en `src/<módulo>/`
6. **REFACTOR** (implementer): limpiar con suite verde
7. **Review** (reviewer): Review Report sin CRITICAL findings
8. **Validate**: `bun test && bun run validate`
9. **Update BACKLOG**: cambiar Status a DONE

### Para Bug Fixes

1. Reproducir con un test que falle
2. Implementar la corrección mínima
3. Verificar que el test pasa
4. `bun test && bun run lint`

### Para Refactors

1. Verificar que la suite pasa ANTES del refactor
2. Realizar cambios quirúrgicos
3. Verificar que la suite sigue pasando DESPUÉS
4. NO cambiar comportamiento observable

---

## Comandos Frecuentes

```bash
# Validación completa (ejecutar en este orden)
bun run typecheck          # tsc --noEmit
bun run lint               # biome check .
bun test                   # suite completa
bun test --coverage        # cobertura
bun run validate           # openspec validate

# OpenSpec
npx cc-codeconductor openspec plan BC-xxx
npx cc-codeconductor openspec validate
npx cc-codeconductor openspec status
npx cc-codeconductor openspec next

# Formateo
bun run format             # biome format --write .
bun run lint:fix           # biome check --write .
```

---

## Restricciones de Diseño (CDN)

Este widget se inyecta en sitios web de terceros. Esto impone restricciones
que DEBEN respetarse en toda implementación:

1. **Encapsulación**: Los estilos NO deben contaminar el sitio host (Shadow DOM
   o scoped styles)
2. **Zero blocking**: Carga con `defer` — nunca bloquear el parsing del HTML host
3. **Idempotencia**: Múltiples invocaciones sobre el mismo `[data-feedback]` NO
   crean instancias duplicadas
4. **Resilencia**: Valores inválidos en atributos `data-*` usan defaults sin throw
5. **z-index configurable**: Default `9999`, ajustable vía `data-z-index`
6. **Sin dependencias globales**: No contaminar `window` ni `document` más allá de
   lo necesario

---

## Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `BACKLOG.md` | Cola operativa — items BC-xxx con acceptance criteria y scorecards |
| `AGENTS.md` (`.agents/`) | Reglas generales para todos los agentes |
| `openspec/config.yaml` | Configuración OpenSpec (test runner: bun) |
| `.codeconductor/openspec-state.json` | Estado de las task cards OpenSpec |
| `src/index.ts` | Entry point del widget CDN |
| `src/config/types.ts` | Tipos del contrato de configuración |
| `src/config/parse.ts` | Parser de atributos `data-feedback-*` |
| `tests/setup.ts` | Happy-DOM preload para tests con DOM |
| `biome.json` | Configuración de Biome (lint + format) |
| `tsconfig.json` | TypeScript strict + ESNext |
| `.github/workflows/ci.yml` | CI pipeline (install → typecheck → lint → test) |

---

## Lo que NO Hacer

- ❌ Escribir implementación sin test previo (TDD es obligatorio)
- ❌ Usar `any` — siempre `unknown` + narrowing
- ❌ Usar `export default` — siempre named exports
- ❌ Usar enums — siempre union types
- ❌ Agregar dependencias sin justificación técnica
- ❌ Modificar archivos fuera del scope del item actual
- ❌ Aprobar con findings CRITICAL pendientes
- ❌ Commits con atribución de IA (Co-Authored-By)
- ❌ Commits en inglés — siempre español neutro
- ❌ Saltar `bun run validate` antes de entregar
