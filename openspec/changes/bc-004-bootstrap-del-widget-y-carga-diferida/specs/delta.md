# Delta Spec: Bootstrap del widget y carga diferida

## ADDED Requirements

- El widget se inicializa automaticamente al detectar un elemento [data-feedback] tras DOMContentLoaded
- La inicializacion es idempotente: un segundo intento sobre el mismo elemento no crea instancias duplicadas
- El script exporta una funcion initFeedbackWidget opcional para inicializacion manual
- Tests verifican auto-init y prevencion de doble instancia con DOM simulado
