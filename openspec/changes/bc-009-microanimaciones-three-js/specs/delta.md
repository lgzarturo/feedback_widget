# Delta Spec: Microanimaciones Three.js

## ADDED Requirements

- Al abrir el modal se reproduce una animacion de entrada cuando data-animation es on
- Al cerrar el modal se reproduce una animacion de salida cuando data-animation es on
- Los errores de validacion de formulario muestran un efecto visual breve en el campo afectado
- Si WebGL no esta disponible el widget funciona sin animaciones y sin errores en consola
- data-animation off desactiva todas las animaciones Three.js
- Tests verifican activacion, desactivacion y fallback sin WebGL
