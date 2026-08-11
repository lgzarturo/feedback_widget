# AGENTS.md — Feedback Widget CDN

Reglas y convenciones del proyecto para todos los agentes de IA.
Aplica a cualquier herramienta (Antigravity, Cursor, Claude Code, Copilot, etc.)
que opere sobre este repositorio.

---

## Stack del Proyecto

| Capa | Herramienta | Versión Mínima |
|------|-------------|----------------|
| Runtime | Bun | 1.1.0 |
| Lenguaje | TypeScript | 5.7+ |
| Modo TS | `strict: true`, `ESNext`, `verbatimModuleSyntax` |  |
| Lint/Format | Biome | 1.9+ |
| Tests | `bun test` + Happy-DOM (preload via `bunfig.toml`) |  |
| DOM simulado | `@happy-dom/global-registrator` | 20.x |
| Spec gate | `npx cc-codeconductor openspec validate` |  |
| Build (futuro) | `bun build` → IIFE `dist/feedback.min.js` |  |

---

## Disciplina de Comportamiento

Estas reglas aplican a TODOS los agentes en TODAS las tareas. Son no negociables.

### 1. Pensar Antes de Codificar

Declarar supuestos explícitamente. Si hay incertidumbre, preguntar.
Si existen múltiples interpretaciones, presentarlas — no elegir en silencio.
Si existe un enfoque más simple, decirlo.

### 2. Simplicidad Primero (YAGNI)

Escribir el código mínimo que resuelve el problema. Sin features adicionales.
Sin abstracciones para uso único. Sin "flexibilidad" especulativa.
Preguntarse: "¿Un senior diría que esto está sobrecomplicado?"

### 3. Cambios Quirúrgicos

Tocar SOLO lo necesario. No "mejorar" código adyacente.
Respetar el estilo existente. Eliminar solo lo que TUS cambios dejaron sin uso.
Cada línea cambiada debe trazar directamente a la solicitud del usuario.

### 4. Ejecución Orientada a Objetivos

Transformar tareas en metas verificables con criterios de éxito.
Para tareas multi-paso, declarar un plan con checkpoints de verificación.
Iterar hasta verificar.

### 5. Stdlib-First

Preferir APIs nativas de Bun y la biblioteca estándar sobre paquetes de terceros.
Antes de agregar una dependencia: "¿Bun/Node built-in resuelve esto?"

---

## Convenciones de Código

### TypeScript

- `strict: true` — sin excepciones
- `type` imports con `import type { ... }` (enforced por `verbatimModuleSyntax`)
- Sin `any` explícito — usar `unknown` y narrowing
- Sin enums — usar union types (`type X = "a" | "b"`)
- Funciones puras cuando sea posible
- Exports nombrados — sin `export default`

### Formato y Estilo

- Indentación: 2 espacios (Biome)
- Ancho de línea: 100 caracteres
- Punto y coma: requerido (Biome default)
- Comillas: dobles (Biome default)
- Imports organizados automáticamente por Biome

### Estructura de Archivos

```
src/
  index.ts           # entry point CDN — re-exporta módulos públicos
  config/            # parser de data-feedback-* y tipos (BC-003)
  ui/                # trigger button, modal, forms (BC-005–008)
  api/               # cliente HTTP de feedback (BC-010)
  animations/        # animaciones UI (BC-009)
tests/
  setup.ts           # Happy-DOM GlobalRegistrator (preload)
  smoke.test.ts      # smoke tests de toolchain
  config/            # tests de configuración
  ui/                # tests de componentes UI
```

### Naming de Tests

Convención obligatoria: `given_<precondición>_when_<acción>_then_<resultado>`

```typescript
test("given_minimal_host_when_parse_then_applies_all_defaults", () => { ... });
test("given_invalid_position_when_parse_then_uses_default_without_throw", () => { ... });
```

Los `describe` blocks se nombran con el ID del backlog item: `describe("BC-003 parseFeedbackConfig", () => { ... })`.

### Tests DOM

- `tests/setup.ts` registra Happy-DOM vía `bunfig.toml` preload
- Simular elementos host: `document.createElement("div")` + `data-feedback` attributes
- Mockear `fetch` para tests de API (BC-010+)
- Nunca depender de un browser real — Happy-DOM provee `document`, `window`, etc.

---

## Comandos de Validación

Ejecutar en este orden antes de cualquier commit o entrega:

```bash
bun run typecheck          # tsc --noEmit
bun run lint               # biome check .
bun test                   # suite completa
bun test --coverage        # cobertura (umbral futuro: ≥80%)
bun run validate           # openspec validate
```

---

## Flujo de Trabajo: Spec-Driven Development + TDD

### Máquina de Estados del Backlog

```
TODO → READY → PLANNED → IN_PROGRESS → REVIEW → DONE → Archive
         ↑                                  |
         └──── BLOCKED ←────────────────────┘
```

`BLOCKED` retorna a `READY` cuando se resuelve.
Rechazo del reviewer: `REVIEW` → `IN_PROGRESS`.

### Ciclo TDD Estricto

Cada feature sigue Red-Green-Refactor sin excepciones:

1. **RED** — Test que falla por lógica ausente (NO por error de compilación)
2. **GREEN** — Implementación mínima para pasar el test
3. **REFACTOR** — Limpiar con suite verde

No escribir código de implementación durante RED.
No refactorizar durante GREEN.
Mezclar fases invalida el ciclo.

### Flujo OpenSpec por Item

```bash
npx cc-codeconductor openspec plan BC-xxx     # genera estructura
npx cc-codeconductor openspec validate        # gate pre-entrega
npx cc-codeconductor openspec status          # estado actual
npx cc-codeconductor openspec next            # siguiente item
```

Cada item genera `openspec/changes/<slug>/` con:
- `proposal.md` — propuesta y scope
- `design.md` — plan técnico
- `tasks.md` — checklist de implementación
- `specs/` — especificaciones formales

---

## Política de Routing de Agentes

### Clasificación de Riesgo

| Señal | Nivel |
|-------|-------|
| Nuevo comportamiento sin tests existentes | medium |
| Cambios a API pública o contratos | high |
| Seguridad, auth, API keys | high |
| Refactor interno con cobertura completa | low |
| Documentación solamente | low |
| Bug fix en componente aislado | low–medium |

### Tabla de Routing

| Tipo de Tarea | Riesgo | Ruta |
|---------------|--------|------|
| Feature nueva | any | task-coach → architect → tester → implementer → reviewer |
| Bug fix | low | implementer |
| Bug fix | medium–high | task-coach → implementer → tester |
| Refactor | low | implementer |
| Refactor | medium–high | architect → implementer → reviewer |
| Cobertura de tests | any | tester |
| Documentación | any | docs |

### Fases OpenSpec

| Fase | Agente |
|------|--------|
| discover | repo-explorer |
| design | architect |
| test | tester |
| implement | implementer |
| review | reviewer |

Cuando `TDD required: yes` (siempre en este proyecto), test ejecuta ANTES de implement.

---

## Contratos de Agente

### task-coach

**Rol**: Transforma solicitudes vagas en Task Cards completas.
**Permisos**: read: allow, edit: deny, bash: deny
**Campos requeridos**: title, type, risk, scope, context, acceptance criteria

### repo-explorer

**Rol**: Mapea estructura del repositorio e identifica convenciones.
**Permisos**: read: allow, edit: deny, bash: allow (git log/diff/status)
**Produce**: Repo Map con estructura, convenciones y archivos relevantes.

### architect

**Rol**: Diseña el enfoque técnico.
**Permisos**: read: allow, edit: ask (solo docs/ADRs), bash: deny
**Produce**: Technical Plan con approach, tradeoffs, archivos afectados y riesgos.
**Gate**: El plan DEBE ser aprobado por el humano antes de implementar.

### tester

**Rol**: Escribe tests que cubran los acceptance criteria.
**Permisos**: read: allow, edit: ask (solo archivos de test), bash: allow (test commands)
**Convención de naming**: `given_X_when_Y_then_Z`
**Mínimo**: un happy path, un edge case, un failure case por función.

### implementer

**Rol**: Ejecuta el Technical Plan aprobado con diff mínimo.
**Permisos**: read: allow, edit: ask, bash: allow (build/test/lint)
**Reglas quirúrgicas**: Modificar SOLO archivos planificados. Respetar estilo existente.
**Post-implementation**: Ejecutar `bun test` y producir Implementation Summary.

### reviewer

**Rol**: Revisa diffs para correctness, arquitectura, seguridad y deuda técnica.
**Permisos**: read: allow, edit: deny, bash: allow (git diff/status/test)
**Ejes de revisión**: Correctness, Architecture, Security, Performance, Test coverage
**Produce**: Review Report con CRITICAL / WARNING / SUGGESTION.
**Gate**: Findings CRITICAL bloquean merge.

---

## Git Commits

### Formato

```
<tipo>(<scope>): <descripción corta>

- <detalle 1>
- <detalle 2>
```

### Tipos válidos

`feat` `fix` `docs` `style` `refactor` `test` `chore` `perf` `ci` `build` `revert`

### Reglas

- Idioma: **español neutro** siempre
- Encabezado: máximo 69 caracteres, sin punto final
- Cuerpo: viñetas concisas, una idea por línea
- Sin gerundios ("agregando") — usar infinitivo o imperativo ("agregar")
- Sin atribución de IA (Co-Authored-By, etc.)

---

## Integración CDN

El widget se embebe en sitios externos mediante un tag HTML:

```html
<div data-feedback data-api-key="..." data-position="bottom-right"></div>
<script defer src="https://cdn.appsutiles.dev/feedback-widget.js"></script>
```

Esto implica restricciones de diseño:

- **Encapsulación total**: Los estilos del widget NO deben contaminar el sitio host
- **Zero blocking**: El script se carga con `defer` — nunca bloquear el parsing
- **Idempotencia**: Múltiples invocaciones sobre el mismo host NO crean duplicados
- **z-index configurable**: Default `9999`, ajustable vía `data-z-index`

---

## Scorecards

Cada item del BACKLOG incluye un Scorecard con criterios ponderados por fase.
Umbral mínimo de aprobación: **85%**.
Un criterio con peso ≥ 10% no cumplido **bloquea** el avance a la fase siguiente.

---

## Archivos Ignorados por Biome

Los siguientes directorios no son procesados por Biome (ver `biome.json`):
`node_modules`, `dist`, `graphify-out`, `.git`, `.codeconductor`, `.cursor`, `.claude`, `.agents`, `openspec`, `.codebase-memory`

---

## Skills Disponibles

| Skill | Cuándo usar |
|-------|-------------|
| `bun-typescript-widget` | Implementación, tests y validación del widget |
| `openspec` | Editar BACKLOG.md, `openspec validate`, plan BC-xxx |
| `cc-feature` | Flujo completo feature (task-coach → implementer) |
| `cc-fix` | Bug fix con Task Card |
| `cc-review` | Revisión estructurada pre-merge |
| `cc-tdd-cycle` | Ciclo Red-Green-Refactor estricto |
| `cc-test-plan` | Plan de pruebas sin código |
| `testing-tdd` | Pirámide de tests, naming, mocks |
| `security` | API key en HTML, OWASP, validación de input |
