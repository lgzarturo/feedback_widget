# Delta Spec: Publicacion jsDelivr via GitHub Releases

## ADDED Requirements

- Push de tag v* dispara workflow que adjunta dist/feedback.min.js al GitHub Release
- README documenta URL https://cdn.jsdelivr.net/gh/lgzarturo/feedback_widget@VERSION/dist/feedback.min.js
- README incluye ejemplo HTML minimo con script defer y div data-feedback
- CHANGELOG.md registra la primera version publicada con instrucciones de actualizacion
- Verificacion manual documentada: cargar URL jsDelivr en playground y confirmar widget funcional
