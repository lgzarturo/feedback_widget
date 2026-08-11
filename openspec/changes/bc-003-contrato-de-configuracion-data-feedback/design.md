# Design: Contrato de configuracion data-feedback

**Status:** Aprobado — listo para fase test.

## Approach

Parser tipado que lee atributos `data-feedback` del elemento host via `HTMLElement.dataset`, normaliza alias de posicion, valida colores hex y aplica defaults documentados sin lanzar excepciones. Sin logica de UI, HTTP ni animaciones.

## Contrato WidgetConfig (src/config/types.ts)

```typescript
export type WidgetPosition =
  | "bottom-left"
  | "bottom-right"
  | "top-left"
  | "top-right";

export type WidgetAnimation = "on" | "off";

export interface WidgetConfig {
  apiKey: string;
  baseUrl: string;
  source: string;
  position: WidgetPosition;
  primaryColor: string;
  accentColor: string;
  locale: string;
  animation: WidgetAnimation;
  zIndex: number;
}
```

## API publica (src/config/parse.ts)

| Export | Tipo | Descripcion |
|--------|------|-------------|
| `DEFAULT_WIDGET_CONFIG` | `WidgetConfig` | Objeto con todos los defaults |
| `parseFeedbackConfig` | `(host: HTMLElement) => WidgetConfig` | Parser principal |

Helpers internos (no exportados): `parsePosition`, `parseColor`, `parseAnimation`, `parseZIndex`, `parseBaseUrl`.

## Defaults documentados

| Campo | Default |
|-------|---------|
| `apiKey` | `""` |
| `baseUrl` | `https://api.appsutiles.dev` |
| `source` | `""` |
| `position` | `bottom-right` |
| `primaryColor` | `#2563eb` |
| `accentColor` | `#1d4ed8` |
| `locale` | `es` |
| `animation` | `on` |
| `zIndex` | `9999` |

## Mapeo de alias de posicion

| Valor de entrada | Valor canonico |
|------------------|----------------|
| `bottom-left` | `bottom-left` |
| `bottom-right` | `bottom-right` |
| `top-left` | `top-left` |
| `top-right` | `top-right` |
| `left-bottom` | `bottom-left` |
| `right-bottom` | `bottom-right` |
| cualquier otro | `bottom-right` (default) |

## Reglas de validacion (sin excepciones)

| Campo | Valido | Invalido → default |
|-------|--------|-------------------|
| `position` | canonicos + alias de tabla | `bottom-right` |
| `primaryColor` / `accentColor` | `#RGB` o `#RRGGBB` (case-insensitive) | `#2563eb` / `#1d4ed8` |
| `animation` | `on`, `off` | `on` |
| `zIndex` | entero positivo parseable | `9999` |
| `baseUrl` | string no vacio (trim) | `https://api.appsutiles.dev` |
| `apiKey`, `source`, `locale` | string tal cual (trim) | default de tabla si ausente |

## Re-export (src/config/index.ts)

```typescript
export type { WidgetConfig, WidgetPosition, WidgetAnimation } from "./types";
export { DEFAULT_WIDGET_CONFIG, parseFeedbackConfig } from "./parse";
```

## Files Affected

- `src/config/types.ts` — crear
- `src/config/parse.ts` — crear
- `src/config/index.ts` — actualizar
- `tests/config/parse.test.ts` — crear

## Acceptance Criteria

- [x] Parser lee data-api-key, data-base-url, data-source, data-position, data-primary-color, data-accent-color, data-locale, data-animation y data-z-index
- [x] data-base-url por defecto es https://api.appsutiles.dev cuando no se especifica
- [x] data-position acepta bottom-left, bottom-right, top-left, top-right y alias left-bottom y right-bottom
- [x] Valores invalidos de color o posicion usan defaults documentados sin lanzar excepcion
- [x] Tests cubren configuracion minima, completa y valores invalidos

## Out of scope

Renderizado UI, llamadas HTTP, animaciones Three.js.
