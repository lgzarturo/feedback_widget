# Design: Toolchain de calidad Biome bun test CI y openspec config

**Status:** Aprobado — listo para fase test.

## Approach

Configurar el gate de calidad minimo: Biome como linter/formatter, bun test como runner oficial con happy-dom preload, CI en GitHub Actions y declaracion OpenSpec. Los tests de aceptacion verifican configuracion y comandos antes de cualquier feature posterior.

## Configuracion Biome (biome.json)

```json
{
  "linter": { "enabled": true, "rules": { "recommended": true } },
  "formatter": { "enabled": true, "indentStyle": "space", "indentWidth": 2, "lineWidth": 100 },
  "files": {
    "ignore": [
      "node_modules", "dist", "graphify-out", ".git", ".codeconductor",
      ".cursor", ".claude", ".agents", "openspec", ".codebase-memory"
    ]
  }
}
```

## Scripts npm (package.json)

| Script | Comando | Proposito BC-002 |
|--------|---------|------------------|
| `lint` | `biome check .` | Gate de lint |
| `lint:fix` | `biome check --write .` | Auto-fix |
| `format` | `biome format --write .` | Formateo |
| `test` | `bun test` | Runner oficial |
| `validate` | `npx cc-codeconductor openspec validate` | Gate OpenSpec |

## OpenSpec config (openspec/config.yaml)

```yaml
schema: spec-driven
testing:
  test_runner: bun
```

## Workflow CI (.github/workflows/ci.yml)

```yaml
name: CI
on:
  push:
    branches: [main]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run typecheck
      - run: bun run lint
      - run: bun test
```

Solo `push` a `main`. Sin matrix ni deploy.

## Estructura de tests

```
tests/
  setup.ts          # happy-dom preload (bunfig.toml)
  smoke.test.ts     # tests BC-002 toolchain
  scaffolding.test.ts  # tests BC-001 (existente)
```

## Files Affected

- `biome.json` — anadir `.codebase-memory` a ignore
- `.github/workflows/ci.yml` — crear
- `openspec/config.yaml` — verificar (ya cumple)
- `tests/smoke.test.ts` — expandir
- `package.json` — formatear

## Acceptance Criteria

- [x] `bun test` ejecuta al menos un smoke test en verde
- [x] `openspec/config.yaml` declara `test_runner: bun` en la seccion testing
- [x] El workflow de CI corre install, typecheck, lint y test en push a main
- [x] `bun run lint` ejecuta Biome sin errores en el codigo base

## Out of scope

Tests de logica de negocio del widget, reglas de lint personalizadas mas alla del preset recomendado.
