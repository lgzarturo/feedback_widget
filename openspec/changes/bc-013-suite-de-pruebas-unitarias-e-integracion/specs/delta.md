# Delta Spec: Suite de pruebas unitarias e integracion

## ADDED Requirements

- bun test ejecuta todos los tests sin fallos en CI
- tests/config cubre parser data-feedback con casos validos e invalidos
- tests/api cubre mapeo de payload feedback y contacto con fetch mockeado
- tests/integration/widget-flow.test.ts verifica flujo abrir modal, seleccionar emoji y preparar envio
- tests/integration/widget-flow.test.ts verifica flujo solo-contacto sin tab feedback
- Cobertura de lineas mayor o igual a 80 por ciento segun reporte bun test --coverage
