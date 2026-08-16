# Delta Spec: Overlay de animacion y errores de red

## ADDED Requirements

- Al abrir el modal con WebGL, los estilos de overlay se inyectan en el Shadow Root
- El canvas de animacion no altera la altura del dialog
- El loop RAF continua despues de la duracion de apertura hasta close/dispose
- Si fetch lanza, sendContactMessage devuelve status 0 y mensaje de red
- Tras enviar, el modal muestra un alert de exito o el userMessage de error
- README documenta la allowlist CORS y la URL CDN v1.0.2
