# Proposal: Contrato de configuracion data-feedback

## Why

Definir el contrato de configuracion del widget mediante atributos data-feedback en el elemento host, con parser tipado y valores por defecto documentados.

**Business value:** frontera de configuracion que permite cero setup complejo para el desarrollador integrador.

## What Changes

- `src/config/types.ts` — tipos `WidgetConfig`, `WidgetPosition`, `WidgetAnimation`
- `src/config/parse.ts` — parser `parseFeedbackConfig` y `DEFAULT_WIDGET_CONFIG`
- `src/config/index.ts` — re-exports publicos
- `tests/config/parse.test.ts` — tests de aceptacion BC-003

## Capabilities

- **New Capabilities:** `data-feedback-config`
- **Modified Capabilities:** (ninguna)

## Atributos data-feedback

| Atributo HTML | Campo `WidgetConfig` | Tipo | Default |
|---|---|---|---|
| `data-api-key` | `apiKey` | `string` | `""` |
| `data-base-url` | `baseUrl` | `string` | `https://api.appsutiles.dev` |
| `data-source` | `source` | `string` | `""` |
| `data-position` | `position` | `WidgetPosition` | `bottom-right` |
| `data-primary-color` | `primaryColor` | `string` | `#2563eb` |
| `data-accent-color` | `accentColor` | `string` | `#1d4ed8` |
| `data-locale` | `locale` | `string` | `es` |
| `data-animation` | `animation` | `WidgetAnimation` | `on` |
| `data-z-index` | `zIndex` | `number` | `9999` |

## Conventions

- Lectura via `HTMLElement.dataset` (kebab-case → camelCase automatico del DOM)
- El elemento host MUST tener atributo `data-feedback` para ser detectado por bootstrap (BC-004)
- Parser nunca lanza excepciones; valores invalidos usan defaults documentados
- Sin dependencias externas; solo stdlib + DOM API

## Files Affected

| Archivo | Accion |
|---------|--------|
| `src/config/types.ts` | crear |
| `src/config/parse.ts` | crear |
| `src/config/index.ts` | actualizar re-exports |
| `tests/config/parse.test.ts` | crear |

## Impact

Riesgos: contrato incompleto obliga a retrabajo en items de UI y API.

**Out of scope:** renderizado UI, llamadas HTTP, animaciones Three.js.
