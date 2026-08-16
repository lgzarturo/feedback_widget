# CHANGELOG — Feedback Widget CDN

Todos los cambios notables en este proyecto serán documentados en este archivo.
El formato está basado en [Keep a CHANGELOG](https://keepachangelog.com/es-ES/1.0.0/)
y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

## [1.0.2] - 2026-08-16

### Corregido

- Overlay Three.js del modal: el canvas ya no empuja el formulario ni congela el torus; la escena queda detrás del contenido y el RAF continúa hasta cerrar
- Entrada CSS (`scale` + `opacity`) también en el path WebGL
- `fetch` que falla por red o CORS ya no deja una promesa rechazada; el modal muestra el mensaje al usuario

### Documentación

- URL CDN de integración actualizada a `v1.0.2` / `1.0.2`
- Allowlist CORS requerida en `api.appsutiles.dev` para los sitios host

`1.0.1` permanece publicada en jsDelivr y no se reutiliza.

### Cómo actualizar

```
https://cdn.jsdelivr.net/gh/lgzarturo/feedback_widget@v1.0.2/dist/feedback.min.js
```

Cambia `@1.0.1` o `@v1.0.1` por `@v1.0.2` (o `@1.0.2` en el tag de `gh-pages`).

## [1.0.0] - 2026-08-11

### Primera versión publicada

- Widget CDN completo: bootstrap, UI, formularios, API y animaciones Three.js
- Bundle IIFE `dist/feedback.min.js` (< 200 KB gzip)
- Distribución vía jsDelivr y GitHub Releases

### Cómo actualizar

Para actualizar a una nueva versión, cambia el tag semver en la URL del script:

```
https://cdn.jsdelivr.net/gh/lgzarturo/feedback_widget@v1.0.0/dist/feedback.min.js
```

Reemplaza `@v1.0.0` por la nueva versión (por ejemplo `@v1.0.1` o `@v1.1.0`).
