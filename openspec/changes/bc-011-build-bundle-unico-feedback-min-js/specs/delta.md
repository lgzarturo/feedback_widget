# Delta Spec: Build bundle unico feedback.min.js

## ADDED Requirements

- bun run build genera dist/feedback.min.js como archivo unico IIFE
- El bundle incluye Three.js empaquetado sin requerir script adicional en el host
- El archivo minificado pesa menos de 200 KB gzip segun comando de verificacion documentado
- El script funciona cargado con atributo defer sin modulos ES en el host
- No existen imports a URLs externas en el bundle final
