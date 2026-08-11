# Delta Spec: Playground de pruebas

## ADDED Requirements

### REQ-BC012-001: Servidor playground local

WHEN el desarrollador ejecuta `bun run playground`
THEN el servidor responde en `http://localhost:3456` con `playground/index.html` y el widget cargado desde `dist/feedback.min.js`.

### REQ-BC012-002: Control de posicion en vivo

WHEN el usuario cambia el selector de posicion
THEN el atributo `data-position` del host se actualiza y el boton flotante se reposiciona sin recargar la pagina.

### REQ-BC012-003: Control de colores en vivo

WHEN el usuario cambia primary-color o accent-color
THEN los atributos `data-primary-color` y `data-accent-color` se actualizan y los estilos visuales del widget reflejan el cambio sin recargar.

### REQ-BC012-004: Demostracion de tabs del modal

WHEN el usuario abre el modal desde el playground
THEN puede ver y alternar entre las tabs Feedback y Contacto.

### REQ-BC012-005: Documentacion README

WHEN un integrador lee el README
THEN encuentra instrucciones para ejecutar `bun run playground` localmente.
