# Proposal: Toolchain de calidad Biome bun test CI y openspec config

## Why

Configurar linter y formatter Biome, definir bun test como runner oficial y montar GitHub Actions con typecheck, lint y tests.

**Business value:** gate automatico de calidad para todas las fases siguientes.

## What Changes

- `biome.json` — preset recommended, ignore de artefactos de herramientas
- `.github/workflows/ci.yml` — pipeline install, typecheck, lint, test en push a main
- `openspec/config.yaml` — declarar `test_runner: bun`
- `tests/smoke.test.ts` — tests de aceptación BC-002
- `package.json` — scripts lint/test y formato Biome

## Capabilities

- **New Capabilities:** `toolchain-quality`
- **Modified Capabilities:** (ninguna)

## Files Affected

| Archivo | Acción |
|---------|--------|
| `biome.json` | ajustar `files.ignore` (añadir `.codebase-memory`) |
| `.github/workflows/ci.yml` | crear |
| `openspec/config.yaml` | verificar `testing.test_runner: bun` |
| `tests/smoke.test.ts` | expandir con tests BC-002 |
| `package.json` | formatear para pasar Biome |
| `bunfig.toml` | sin cambios (preload happy-dom ya configurado) |

## Conventions

- Lint: `bun run lint` → `biome check .`
- Format: `bun run format` → `biome format --write .`
- Tests: `bun test` con preload happy-dom vía `bunfig.toml`
- CI: `oven-sh/setup-bun@v2`, `bun install --frozen-lockfile`
- Biome: preset `recommended`, sin reglas custom

## Impact

Riesgos: ninguno relevante.

**Out of scope:** tests de logica de negocio del widget, reglas de lint personalizadas mas alla del preset recomendado.
