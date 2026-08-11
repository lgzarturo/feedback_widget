# Design: Playground de pruebas

**Status:** Aprobado — listo para fase test.

## Approach

Pagina HTML estatica servida localmente con `Bun.serve` (script npm `playground`). El widget se carga desde `dist/feedback.min.js` con `defer`. Los controles en `controls.js` sincronizan atributos `data-*` en el host y aplican cambios visuales al DOM ya montado sin recargar la pagina.

## Layout

Dos columnas:

| Zona | Contenido |
|------|-----------|
| Panel izquierdo | Controles: posicion (select), primary-color (color input), accent-color (color input), guia modal |
| Panel derecho | Area de preview con fondo neutro |

## Atributos configurables en vivo

| Control | Atributo host | Efecto visual |
|---------|---------------|---------------|
| `#ctrl-position` | `data-position` | Estilos inline de `.fw-trigger-host` |
| `#ctrl-primary-color` | `data-primary-color` | `background-color` de `.fw-trigger` en shadow root |
| `#ctrl-accent-color` | `data-accent-color` | `background-color` de botones submit en shadow roots |

## Estrategia de actualizacion en vivo

El widget parsea configuracion una sola vez en bootstrap. `controls.js` actua como capa de demostracion:

1. `setAttribute` en `#widget-host` (fuente de verdad visible)
2. `applyLiveStyles()` manipula DOM montado:
   - Posicion: mapa espejo de `src/ui/styles.ts` (offset 24px, cuatro esquinas)
   - Primary: reescribe regla en `<style>` del shadow root del trigger
   - Accent: reescribe `background-color` en botones submit del modal/formularios

Selectores dependientes: `.fw-trigger-host`, `.fw-modal-host`.

## Servidor local

```json
"playground": "bun run build && bun -e \"...Bun.serve port 3456...\""
```

Rutas: `/` → `playground/index.html`, `/dist/*` → `dist/`, `/controls.js` → `playground/controls.js`.

## API key

- HTML usa `data-api-key="pk_test_placeholder"`
- `.env.example` documenta `PLAYGROUND_API_KEY` para pruebas locales opcionales
- README advierte no usar claves reales en demos publicas

## Demostracion modal

Seccion en HTML con instrucciones para:
1. Clic en boton flotante
2. Alternar tabs **Feedback** y **Contacto**

## Files Affected

| Archivo | Accion |
|---------|--------|
| `playground/index.html` | crear |
| `playground/controls.js` | crear |
| `package.json` | script `playground` |
| `tests/playground/playground.test.ts` | crear |
| `.env.example` | crear |
| `README.md` | seccion Playground |

## Acceptance Criteria

- [x] `bun run playground` sirve playground en localhost con widget cargado
- [x] Controles cambian `data-position` entre cuatro esquinas en vivo
- [x] Controles cambian `data-primary-color` y `data-accent-color` en vivo
- [x] Pagina demuestra tabs Feedback y Contacto del modal
- [x] README documenta ejecucion del playground

## Out of scope

Despliegue a produccion, autenticacion, persistencia, cambios en `src/`, API de reload del widget.
