# Delta Spec: Formulario de contacto y envio solo-contacto

## ADDED Requirements

- El formulario muestra campos name, email y message con labels accesibles
- Validacion inline rechaza email invalido y campos vacios antes del envio
- El usuario puede enviar contacto desde el tab Contacto sin interactuar con el tab Feedback
- El payload preparado incluye metadata con formType contact
- Tests verifican validacion de email, campos requeridos y payload de contacto
