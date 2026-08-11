# Delta Spec: Formulario de feedback con emojis

## ADDED Requirements

- El formulario muestra cinco emojis seleccionables representando niveles de satisfaccion
- El usuario puede enviar seleccionando solo un emoji sin escribir comentario
- El payload preparado incluye metadata con rating numerico, ratingEmoji y formType feedback
- Validacion inline impide envio sin emoji seleccionado mostrando mensaje de error
- Tests verifican seleccion de emoji, envio minimo y rechazo sin seleccion
