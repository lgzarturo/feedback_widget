# Design: Build bundle unico feedback.min.js

**Status:** Aprobado — listo para fase test.

## Approach

Pipeline `build.ts` con `Bun.build` produce un IIFE minificado autocontenido desde `src/index.ts`. Bootstrap monta el widget completo (trigger → modal con formularios → API) para que el grafo de imports incluya UI, Three.js y cliente HTTP en el bundle CDN.

## Configuracion Bun.build

```typescript
await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  naming: {
    entry: "feedback.min.[ext]",
    chunk: "[name].[ext]",
    asset: "[name].[ext]",
  },
  format: "iife",
  minify: true,
  sourcemap: "linked",
  target: "browser",
});
```

## Convenciones IIFE y minificacion

| Aspecto | Valor |
|---------|-------|
| Formato | `iife` (experimental Bun) |
| Minificacion | `minify: true` (whitespace, syntax, identifiers) |
| Source map | `linked` → `dist/feedback.min.js.map` (solo local, no publicar en prod) |
| Entry CDN | `<script defer src=".../dist/feedback.min.js"></script>` |
| Sin ESM en host | El bundle no expone `import`/`export` al sitio host |

## Tree-shaking Three.js

- Imports granulares en `modal-scene.ts` (`WebGLRenderer`, `TorusGeometry`, etc.)
- Grafo completo vía `bootstrap` → `modal` → `animations` → `three`
- Sin CDN externo de Three.js en el bundle final

## Limite de tamano

Umbral: **&lt; 204 800 bytes** gzip (200 KB).

Comando de verificacion cross-platform:

```bash
bun -e "const fs=require('fs');const z=require('zlib');const b=fs.readFileSync('dist/feedback.min.js');console.log(z.gzipSync(b).length)"
```

`build.ts` imprime el tamano gzip tras cada build.

## Montaje widget en bootstrap

`createFeedbackModal(config, { withForms: true })` monta formularios en tabpanels y envia via `sendContactMessage`.

`createInstance` en bootstrap:

1. `createFeedbackModal(config, { withForms: true })`
2. `createTriggerButton(config, () => modal.open())`
3. `document.body.appendChild(trigger)` y `document.body.appendChild(modal.host)`
4. `FeedbackWidgetInstance` extiende con `trigger` y `modal` opcionales

`withForms` default `false` preserva tests BC-006 con paneles vacios.

## Files Affected

| Archivo | Accion |
|---------|--------|
| `build.ts` | crear |
| `package.json` | scripts `build`, `build:check-size` |
| `dist/feedback.min.js` | generado |
| `dist/feedback.min.js.map` | generado |
| `src/bootstrap.ts` | montaje trigger/modal |
| `src/ui/modal.ts` | opcion `withForms` |
| `tests/build/build.test.ts` | crear |
| `tests/bootstrap.test.ts` | tests montaje BC-011 |

## Acceptance Criteria

- [x] `bun run build` genera `dist/feedback.min.js` como archivo unico IIFE
- [x] El bundle incluye Three.js empaquetado sin script adicional en el host
- [x] El archivo minificado pesa menos de 200 KB gzip
- [x] El script funciona con `defer` sin modulos ES en el host
- [x] No existen imports a URLs externas en el bundle final
- [x] Bootstrap monta trigger, modal y formularios

## Out of scope

Publicacion npm, semver automatico, source maps publicos, playground, release jsDelivr, status bar post-envio.
