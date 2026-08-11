# Proposal: Publicacion jsDelivr via GitHub Releases

## Why

Configurar el flujo de publicacion del bundle en jsDelivr via GitHub Releases con tags semver y documentar la URL de integracion CDN en README.

**Business value:** distribucion gratuita y global del widget sin infraestructura propia de CDN

## What Changes

- `.github/workflows/release.yml` — workflow de release en tags `v*`
- `README.md` — seccion CDN jsDelivr con ejemplo HTML y verificacion manual
- `CHANGELOG.md` — entrada `[1.0.0]` con instrucciones de actualizacion
- `tests/release/release.test.ts` — tests de workflow, README y CHANGELOG

## Capabilities

- **New Capabilities:** `jsdelivr-cdn-release`
- **Modified Capabilities:** ninguna en `src/`

## Convenciones

- Tags semver con prefijo `v` (`v1.0.0`)
- URL jsDelivr: `cdn.jsdelivr.net/gh/lgzarturo/feedback_widget@VERSION/dist/feedback.min.js`
- Solo `dist/feedback.min.js` como asset de release (sin source map)

## Files Affected

| Archivo | Accion |
|---------|--------|
| `.github/workflows/release.yml` | crear |
| `README.md` | modificar |
| `CHANGELOG.md` | modificar |
| `tests/release/release.test.ts` | modificar |

## Impact

Riesgos: usuario de GitHub incorrecto en URL; parametrizar con variable en README.

**Out of scope:** publicacion en npm registry, CDN alternativos, versionado automatico desde commits.
