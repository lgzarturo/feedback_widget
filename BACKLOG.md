# BACKLOG — Feedback Widget CDN

Cola operativa de CodeConductor para el widget de feedback embebible vía CDN.
Cada item BC-xxx se ejecuta con el flujo OpenSpec (npx cc-codeconductor openspec plan BC-xxx),
generando openspec/changes/<slug>/ con proposal, design, tasks y specs.
Validar SIEMPRE antes de entregar: npx cc-codeconductor openspec validate.

Maquina de estados: TODO -> READY -> PLANNED -> IN_PROGRESS -> REVIEW -> DONE -> Archive.

## Global

- Product: Feedback Widget CDN
- Strategy: Spec-Driven Development + TDD (red -> green -> refactor); FIFO por prioridad y grafo de dependencias
- Policy: Toda entrega debe pasar npx cc-codeconductor openspec validate y bun test antes de merge; ningun item mayor a 1-2 sesiones de implementacion
- Review required: yes
- TDD required: yes

## Items

### BC-011 | Build bundle unico feedback.min.js

- Priority: P0
- Status: TODO
- Type: feature
- Owner: implementer
- Depends on: BC-004, BC-005, BC-006, BC-007, BC-008, BC-009, BC-010
- Description: Configurar el pipeline de build que produce un unico archivo feedback.min.js autocontenido, minificado y listo para CDN sin dependencias runtime externas en el sitio host.
- Scope: build.ts, package.json scripts, dist/feedback.min.js, dist/feedback.min.js.map
- Out of scope: publicacion en npm registry, versionado semver automatico, source maps publicos en produccion
- Business value: script de una sola linea para integradores sin configuracion de bundler en el sitio host
- Acceptance:
  - [ ] bun run build genera dist/feedback.min.js como archivo unico IIFE
  - [ ] El bundle incluye Three.js empaquetado sin requerir script adicional en el host
  - [ ] El archivo minificado pesa menos de 200 KB gzip segun comando de verificacion documentado
  - [ ] El script funciona cargado con atributo defer sin modulos ES en el host
  - [ ] No existen imports a URLs externas en el bundle final
- Risks: tamano del bundle con Three.js; optimizar imports en implementacion
- Progress: 0%
- Reviewer: reviewer
- Last update: 2026-08-10

#### Scorecard BC-011

Flujo de fases para este item (TDD + Spec-Driven). Umbral minimo de aprobacion: 85 por ciento.
Un criterio con peso mayor o igual a 10 por ciento no cumplido bloquea el avance a la fase siguiente.

| Fase      | Criterio                                                                        | Peso  | Estado   |
|-----------|---------------------------------------------------------------------------------|-------|----------|
| discover  | Archivos de build y salida dist listados en proposal.md                         | 10 %  | pendiente |
| discover  | Convenciones de formato IIFE y minificacion documentadas                      | 5 %   | pendiente |
| design    | Configuracion de bun build y limites de tamano definidos en design.md           | 15 %  | pendiente |
| design    | Estrategia de tree-shaking de Three.js explicita en design.md                   | 10 %  | pendiente |
| design    | design.md aprobado por revisor antes de comenzar fase test                      | 5 %   | pendiente |
| test      | Test de build escrito y en rojo antes de implementar pipeline                   | 15 %  | pendiente |
| test      | Test verifica existencia de dist/feedback.min.js y ausencia de imports externos   | 10 %  | pendiente |
| test      | Cada acceptance criterion tiene al menos un test nombrado                       | 10 %  | pendiente |
| implement | Implementacion minimal sin codigo fuera del plan de diseno                      | 10 %  | pendiente |
| implement | bun run build genera bundle funcional y tests de build pasan en verde           | 10 %  | pendiente |
| review    | Cero findings CRITICAL en Review Report                                         | 10 %  | pendiente |
| review    | npx cc-codeconductor openspec validate pasa sin errores                         | 5 %   | pendiente |

OpenSpec folder: openspec/changes/bc-011-build-cdn-bundle/

---

### BC-012 | Playground de pruebas

- Priority: P1
- Status: TODO
- Type: feature
- Owner: implementer
- Depends on: BC-011
- Description: Crear una pagina playground local para probar el widget con controles en vivo que modifican atributos data-feedback sin recargar la pagina.
- Scope: playground/index.html, playground/controls.js, package.json script playground
- Out of scope: despliegue del playground a produccion, autenticacion, persistencia de configuracion
- Business value: entorno de demostracion y validacion manual para desarrolladores integradores
- Acceptance:
  - [ ] bun run playground sirve playground/index.html en localhost con el widget cargado
  - [ ] Controles permiten cambiar data-position entre las cuatro esquinas en vivo
  - [ ] Controles permiten cambiar data-primary-color y data-accent-color en vivo
  - [ ] La pagina demuestra ambos tabs Feedback y Contacto del modal
  - [ ] README documenta como ejecutar el playground localmente
- Risks: API key de prueba expuesta en playground; usar placeholder y .env.example
- Progress: 0%
- Reviewer: reviewer
- Last update: 2026-08-10

#### Scorecard BC-012

Flujo de fases para este item (TDD + Spec-Driven). Umbral minimo de aprobacion: 85 por ciento.
Un criterio con peso mayor o igual a 10 por ciento no cumplido bloquea el avance a la fase siguiente.

| Fase      | Criterio                                                                        | Peso  | Estado   |
|-----------|---------------------------------------------------------------------------------|-------|----------|
| discover  | Archivos del playground listados en proposal.md                                 | 10 %  | pendiente |
| discover  | Convenciones de servidor local y scripts documentadas                           | 5 %   | pendiente |
| design    | Layout del playground y controles definidos en design.md antes de implementar   | 15 %  | pendiente |
| design    | Lista de atributos configurables en vivo explicita en design.md                 | 10 %  | pendiente |
| design    | design.md aprobado por revisor antes de comenzar implementacion                  | 5 %   | pendiente |
| test      | Test de smoke verifica que bun run playground inicia sin error                    | 15 %  | pendiente |
| test      | Test verifica existencia de controles para posicion y colores en playground     | 10 %  | pendiente |
| test      | Cada acceptance criterion tiene al menos un test nombrado                       | 10 %  | pendiente |
| implement | Implementacion minimal sin codigo fuera del plan de diseno                      | 10 %  | pendiente |
| implement | Playground funcional con widget cargado desde dist/feedback.min.js              | 10 %  | pendiente |
| review    | Cero findings CRITICAL en Review Report                                         | 10 %  | pendiente |
| review    | npx cc-codeconductor openspec validate pasa sin errores                         | 5 %   | pendiente |

OpenSpec folder: openspec/changes/bc-012-playground/

---

### BC-013 | Suite de pruebas unitarias e integracion

- Priority: P1
- Status: TODO
- Type: feature
- Owner: tester
- Depends on: BC-002, BC-010
- Description: Consolidar la suite de pruebas unitarias e integracion que cubre parser de configuracion, formularios, cliente API y flujo completo de envio con fetch mockeado.
- Scope: tests/config/, tests/ui/, tests/api/, tests/integration/widget-flow.test.ts
- Out of scope: pruebas end-to-end con navegador real, pruebas de carga, pruebas contra API de produccion
- Business value: regresion automatica que garantiza calidad antes de cada release CDN
- Acceptance:
  - [ ] bun test ejecuta todos los tests sin fallos en CI
  - [ ] tests/config cubre parser data-feedback con casos validos e invalidos
  - [ ] tests/api cubre mapeo de payload feedback y contacto con fetch mockeado
  - [ ] tests/integration/widget-flow.test.ts verifica flujo abrir modal, seleccionar emoji y preparar envio
  - [ ] tests/integration/widget-flow.test.ts verifica flujo solo-contacto sin tab feedback
  - [ ] Cobertura de lineas mayor o igual a 80 por ciento segun reporte bun test --coverage
- Risks: tests de DOM fragiles; usar helpers de test estables
- Progress: 0%
- Reviewer: reviewer
- Last update: 2026-08-10

#### Scorecard BC-013

Flujo de fases para este item (TDD + Spec-Driven). Umbral minimo de aprobacion: 85 por ciento.
Un criterio con peso mayor o igual a 10 por ciento no cumplido bloquea el avance a la fase siguiente.

| Fase      | Criterio                                                                        | Peso  | Estado   |
|-----------|---------------------------------------------------------------------------------|-------|----------|
| discover  | Inventario de tests existentes y faltantes listado en proposal.md                | 10 %  | pendiente |
| discover  | Convenciones de mocks y helpers DOM documentadas                                | 5 %   | pendiente |
| design    | Plan de cobertura por modulo definido en design.md antes de escribir tests      | 15 %  | pendiente |
| design    | Escenarios de integracion feedback y solo-contacto explicitos en design.md      | 10 %  | pendiente |
| design    | design.md aprobado por revisor antes de comenzar fase test                      | 5 %   | pendiente |
| test      | Tests de integracion escritos y en rojo antes de completar implementacion       | 15 %  | pendiente |
| test      | Tests cubren flujos happy path y errores de API con fetch mockeado              | 10 %  | pendiente |
| test      | Cada acceptance criterion tiene al menos un test nombrado                       | 10 %  | pendiente |
| implement | Suite completa sin tests triviales que solo assertan constantes                  | 10 %  | pendiente |
| implement | bun test --coverage reporta 80 por ciento o mas de cobertura de lineas          | 10 %  | pendiente |
| review    | Cero findings CRITICAL en Review Report                                         | 10 %  | pendiente |
| review    | npx cc-codeconductor openspec validate pasa sin errores                         | 5 %   | pendiente |

OpenSpec folder: openspec/changes/bc-013-test-suite/

---

### BC-014 | Publicacion jsDelivr via GitHub Releases

- Priority: P2
- Status: TODO
- Type: feature
- Owner: implementer
- Depends on: BC-011, BC-012, BC-013
- Description: Configurar el flujo de publicacion del bundle en jsDelivr via GitHub Releases con tags semver y documentar la URL de integracion CDN en README.
- Scope: .github/workflows/release.yml, README.md seccion CDN, CHANGELOG.md
- Out of scope: publicacion en npm registry, CDN alternativos, versionado automatico desde commits
- Business value: distribucion gratuita y global del widget sin infraestructura propia de CDN
- Acceptance:
  - [ ] Push de tag v* dispara workflow que adjunta dist/feedback.min.js al GitHub Release
  - [ ] README documenta URL https://cdn.jsdelivr.net/gh/USUARIO/feedback_widget@VERSION/dist/feedback.min.js
  - [ ] README incluye ejemplo HTML minimo con script defer y div data-feedback
  - [ ] CHANGELOG.md registra la primera version publicada con instrucciones de actualizacion
  - [ ] Verificacion manual documentada: cargar URL jsDelivr en playground y confirmar widget funcional
- Risks: usuario de GitHub incorrecto en URL; parametrizar con variable en README
- Progress: 0%
- Reviewer: reviewer
- Last update: 2026-08-10

#### Scorecard BC-014

Flujo de fases para este item (TDD + Spec-Driven). Umbral minimo de aprobacion: 85 por ciento.
Un criterio con peso mayor o igual a 10 por ciento no cumplido bloquea el avance a la fase siguiente.

| Fase      | Criterio                                                                        | Peso  | Estado   |
|-----------|---------------------------------------------------------------------------------|-------|----------|
| discover  | Archivos de release y documentacion listados en proposal.md                     | 10 %  | pendiente |
| discover  | Convenciones de versionado semver documentadas                                  | 5 %   | pendiente |
| design    | Flujo de release y URL jsDelivr definidos en design.md antes de implementar     | 15 %  | pendiente |
| design    | Plantilla de ejemplo HTML de integracion explicita en design.md                   | 10 %  | pendiente |
| design    | design.md aprobado por revisor antes de comenzar implementacion                  | 5 %   | pendiente |
| test      | Test de smoke verifica sintaxis valida del workflow release.yml                 | 15 %  | pendiente |
| test      | Test verifica que README contiene patron de URL jsDelivr y ejemplo defer        | 10 %  | pendiente |
| test      | Cada acceptance criterion tiene al menos un test nombrado                       | 10 %  | pendiente |
| implement | Workflow release.yml funcional con artifact dist/feedback.min.js                | 10 %  | pendiente |
| implement | Tag v0.1.0 de prueba genera release con bundle adjunto                          | 10 %  | pendiente |
| review    | Cero findings CRITICAL en Review Report                                         | 10 %  | pendiente |
| review    | npx cc-codeconductor openspec validate pasa sin errores                         | 5 %   | pendiente |

OpenSpec folder: openspec/changes/bc-014-jsdelivr-release/

---

## Archive

### BC-010 | Cliente API api.appsutiles.dev

- Priority: P1
- Status: DONE
- Type: feature
- Owner: implementer
- Depends on: BC-003, BC-007, BC-008
- Description: Implementar el cliente HTTP asincrono que envia mensajes a POST /v1/contact/messages de api.appsutiles.dev con headers x-api-key y mapeo de metadata para feedback y contacto.
- Scope: src/api/contact-client.ts, tests/api/contact-client.test.ts
- Out of scope: panel admin de mensajes, rate limiting del lado cliente, almacenamiento local de borradores
- Business value: entrega confiable de feedback y contacto al backend centralizado de AppsUtiles
- Acceptance:
  - [x] POST a {baseUrl}/v1/contact/messages con Content-Type application/json y header x-api-key
  - [x] El body incluye name, email, message, locale, source, submittedAt en ISO8601 y metadata
  - [x] metadata de feedback incluye rating, ratingEmoji, formType feedback y comentario opcional
  - [x] metadata de contacto incluye formType contact
  - [x] Respuesta 401 muestra mensaje de error de API key invalida al usuario
  - [x] Respuesta 400 muestra mensaje de error de validacion al usuario
  - [x] Respuesta 5xx muestra mensaje generico de reintento al usuario
  - [x] Tests con fetch mockeado cubren exito, 401, 400 y 5xx
- Risks: exposicion de API key en atributo HTML del sitio host; documentar buenas practicas
- Progress: 100%
- Reviewer: security-reviewer, reviewer
- Last update: 2026-08-10

#### Scorecard BC-010

Flujo de fases para este item (TDD + Spec-Driven). Umbral minimo de aprobacion: 85 por ciento.
Un criterio con peso mayor o igual a 10 por ciento no cumplido bloquea el avance a la fase siguiente.

| Fase      | Criterio                                                                        | Peso  | Estado      |
|-----------|---------------------------------------------------------------------------------|-------|-------------|
| discover  | Archivos del cliente API listados en proposal.md                                | 10 %  | completado  |
| discover  | Convenciones de manejo de errores HTTP documentadas                              | 5 %   | completado  |
| design    | Contrato de request y response definido en design.md antes de tests             | 15 %  | completado  |
| design    | Mapeo metadata feedback y contacto explicito en design.md                       | 10 %  | completado  |
| design    | design.md aprobado por revisor y security-reviewer antes de fase test           | 5 %   | completado  |
| test      | Tests de contact-client escritos y en rojo antes de implementar                 | 15 %  | completado  |
| test      | Tests cubren exito 201, 401, 400 y 5xx con fetch mockeado                       | 10 %  | completado  |
| test      | Cada acceptance criterion tiene al menos un test nombrado                       | 10 %  | completado  |
| implement | Implementacion minimal sin codigo fuera del plan de diseno                      | 10 %  | completado  |
| implement | bun test tests/api/contact-client.test.ts pasa en verde                         | 10 %  | completado  |
| review    | Cero findings CRITICAL en Review Report y security-reviewer                     | 10 %  | completado  |
| review    | npx cc-codeconductor openspec validate pasa sin errores                         | 5 %   | completado  |

OpenSpec folder: openspec/changes/bc-010-api-contact-client/

---

### BC-009 | Microanimaciones Three.js

- Priority: P2
- Status: DONE
- Type: feature
- Owner: implementer
- Depends on: BC-006
- Description: Integrar Three.js para microanimaciones de apertura y cierre del modal y efectos visuales en estados de validacion de formularios, con degradacion graceful si WebGL no esta disponible.
- Scope: src/animations/modal-scene.ts, src/animations/validation-fx.ts, tests/animations/modal-scene.test.ts
- Out of scope: animaciones complejas 3D, particulas personalizadas, dependencias runtime externas en CDN
- Business value: experiencia visual distintiva sin sacrificar la carga ligera del widget
- Acceptance:
  - [x] Al abrir el modal se reproduce una animacion de entrada cuando data-animation es on
  - [x] Al cerrar el modal se reproduce una animacion de salida cuando data-animation es on
  - [x] Los errores de validacion de formulario muestran un efecto visual breve en el campo afectado
  - [x] Si WebGL no esta disponible el widget funciona sin animaciones y sin errores en consola
  - [x] data-animation off desactiva todas las animaciones Three.js
  - [x] Tests verifican activacion, desactivacion y fallback sin WebGL
- Risks: incremento del tamano del bundle; mitigar con tree-shaking en BC-011
- Progress: 100%
- Reviewer: reviewer
- Last update: 2026-08-10

#### Scorecard BC-009

Flujo de fases para este item (TDD + Spec-Driven). Umbral minimo de aprobacion: 85 por ciento.
Un criterio con peso mayor o igual a 10 por ciento no cumplido bloquea el avance a la fase siguiente.

| Fase      | Criterio                                                                        | Peso  | Estado      |
|-----------|---------------------------------------------------------------------------------|-------|-------------|
| discover  | Archivos de animaciones listados en proposal.md                                 | 10 %  | completado  |
| discover  | Convenciones de integracion Three.js documentadas                               | 5 %   | completado  |
| design    | Escenas de animacion y fallback sin WebGL definidos en design.md antes de tests | 15 %  | completado  |
| design    | Regla data-animation on/off explicita en design.md                            | 10 %  | completado  |
| design    | design.md aprobado por revisor antes de comenzar fase test                      | 5 %   | completado  |
| test      | Tests de animaciones escritos y en rojo antes de implementar                    | 15 %  | completado  |
| test      | Tests cubren activacion, desactivacion y degradacion sin WebGL                  | 10 %  | completado  |
| test      | Cada acceptance criterion tiene al menos un test nombrado                       | 10 %  | completado  |
| implement | Implementacion minimal sin codigo fuera del plan de diseno                      | 10 %  | completado  |
| implement | bun test tests/animations/modal-scene.test.ts pasa en verde                   | 10 %  | completado  |
| review    | Cero findings CRITICAL en Review Report                                         | 10 %  | completado  |
| review    | npx cc-codeconductor openspec validate pasa sin errores                         | 5 %   | completado  |

OpenSpec folder: openspec/changes/bc-009-microanimaciones-three-js/

---

### BC-008 | Formulario de contacto y envio solo-contacto

- Priority: P1
- Status: DONE
- Type: feature
- Owner: implementer
- Depends on: BC-006
- Description: Implementar el formulario de contacto con campos name, email y message, validacion inline y flujo independiente del tab de feedback para enviar solo un mensaje de contacto.
- Scope: src/ui/contact-form.ts, tests/ui/contact-form.test.ts
- Out of scope: cliente API HTTP, animaciones Three.js, formulario de feedback
- Business value: canal de contacto directo sin obligar al usuario a calificar su experiencia
- Acceptance:
  - [x] El formulario muestra campos name, email y message con labels accesibles
  - [x] Validacion inline rechaza email invalido y campos vacios antes del envio
  - [x] El usuario puede enviar contacto desde el tab Contacto sin interactuar con el tab Feedback
  - [x] El payload preparado incluye metadata con formType contact
  - [x] Tests verifican validacion de email, campos requeridos y payload de contacto
- Risks: spam o abuso del formulario; mitigacion futura fuera de scope inicial
- Progress: 100%
- Reviewer: reviewer
- Last update: 2026-08-10

#### Scorecard BC-008

Flujo de fases para este item (TDD + Spec-Driven). Umbral minimo de aprobacion: 85 por ciento.
Un criterio con peso mayor o igual a 10 por ciento no cumplido bloquea el avance a la fase siguiente.

| Fase      | Criterio                                                                        | Peso  | Estado      |
|-----------|---------------------------------------------------------------------------------|-------|-------------|
| discover  | Archivos del formulario contacto listados en proposal.md                        | 10 %  | completado  |
| discover  | Convenciones de validacion de campos documentadas                               | 5 %   | completado  |
| design    | Contrato de campos y reglas de validacion definidos en design.md antes de tests | 15 %  | completado  |
| design    | Flujo solo-contacto sin pasar por feedback explicito en design.md                | 10 %  | completado  |
| design    | design.md aprobado por revisor antes de comenzar fase test                      | 5 %   | completado  |
| test      | Tests de contact-form escritos y en rojo antes de implementar                   | 15 %  | completado  |
| test      | Tests cubren email invalido, campos vacios y envio exitoso                      | 10 %  | completado  |
| test      | Cada acceptance criterion tiene al menos un test nombrado                       | 10 %  | completado  |
| implement | Implementacion minimal sin codigo fuera del plan de diseno                      | 10 %  | completado  |
| implement | bun test tests/ui/contact-form.test.ts pasa en verde                            | 10 %  | completado  |
| review    | Cero findings CRITICAL en Review Report                                         | 10 %  | completado  |
| review    | npx cc-codeconductor openspec validate pasa sin errores                         | 5 %   | completado  |

OpenSpec folder: openspec/changes/bc-008-formulario-de-contacto-y-envio-solo-contacto/

---

### BC-007 | Formulario de feedback con emojis

- Priority: P1
- Status: DONE
- Type: feature
- Owner: implementer
- Depends on: BC-006
- Description: Implementar el formulario de evaluacion de experiencia con escala de emojis de cinco niveles, comentario opcional y envio en un solo clic para facilitar el feedback rapido.
- Scope: src/ui/feedback-form.ts, tests/ui/feedback-form.test.ts
- Out of scope: cliente API HTTP, animaciones Three.js, tab de contacto
- Business value: captura de satisfaccion con minima friccion para el usuario final
- Acceptance:
  - [x] El formulario muestra cinco emojis seleccionables representando niveles de satisfaccion
  - [x] El usuario puede enviar seleccionando solo un emoji sin escribir comentario
  - [x] El payload preparado incluye metadata con rating numerico, ratingEmoji y formType feedback
  - [x] Validacion inline impide envio sin emoji seleccionado mostrando mensaje de error
  - [x] Tests verifican seleccion de emoji, envio minimo y rechazo sin seleccion
- Risks: interpretacion subjetiva de emojis entre culturas; mitigar con data-locale
- Progress: 100%
- Reviewer: reviewer
- Last update: 2026-08-10

#### Scorecard BC-007

Flujo de fases para este item (TDD + Spec-Driven). Umbral minimo de aprobacion: 85 por ciento.
Un criterio con peso mayor o igual a 10 por ciento no cumplido bloquea el avance a la fase siguiente.

| Fase      | Criterio                                                                        | Peso  | Estado      |
|-----------|---------------------------------------------------------------------------------|-------|-------------|
| discover  | Archivos del formulario feedback listados en proposal.md                        | 10 %  | completado  |
| discover  | Convenciones de metadata de satisfaccion documentadas                            | 5 %   | completado  |
| design    | Escala de emojis y estructura metadata definidas en design.md antes de tests    | 15 %  | completado  |
| design    | Reglas de validacion de envio minimo explicitas en design.md                    | 10 %  | completado  |
| design    | design.md aprobado por revisor antes de comenzar fase test                      | 5 %   | completado  |
| test      | Tests de feedback-form escritos y en rojo antes de implementar                  | 15 %  | completado  |
| test      | Tests cubren envio solo-emoji, comentario opcional y error sin seleccion        | 10 %  | completado  |
| test      | Cada acceptance criterion tiene al menos un test nombrado                       | 10 %  | completado  |
| implement | Implementacion minimal sin codigo fuera del plan de diseno                      | 10 %  | completado  |
| implement | bun test tests/ui/feedback-form.test.ts pasa en verde                           | 10 %  | completado  |
| review    | Cero findings CRITICAL en Review Report                                         | 10 %  | completado  |
| review    | npx cc-codeconductor openspec validate pasa sin errores                         | 5 %   | completado  |

OpenSpec folder: openspec/changes/bc-007-formulario-de-feedback-con-emojis/

---

### BC-006 | Modal con tabs feedback y contacto

- Priority: P1
- Status: DONE
- Type: feature
- Owner: implementer
- Depends on: BC-005
- Description: Implementar el contenedor modal que se abre al hacer clic en el boton flotante, con dos pestanas: Feedback y Contacto, navegables por teclado.
- Scope: src/ui/modal.ts, src/ui/tabs.ts, tests/ui/modal.test.ts, tests/ui/tabs.test.ts
- Out of scope: logica de envio de formularios, animaciones Three.js, cliente API
- Business value: estructura de UI que separa evaluacion de experiencia y contacto directo
- Acceptance:
  - [x] Clic en el boton flotante abre el modal; clic en cerrar o tecla Escape lo cierra
  - [x] Existen dos tabs visibles: Feedback y Contacto
  - [x] Las tabs son navegables con flechas izquierda y derecha y activables con Enter
  - [x] El modal implementa focus trap basico mientras esta abierto
  - [x] Tests verifican apertura, cierre y cambio de tab activa
- Risks: conflictos de z-index con modales del sitio host
- Progress: 100%
- Reviewer: reviewer
- Last update: 2026-08-10

#### Scorecard BC-006

Flujo de fases para este item (TDD + Spec-Driven). Umbral minimo de aprobacion: 85 por ciento.
Un criterio con peso mayor o igual a 10 por ciento no cumplido bloquea el avance a la fase siguiente.

| Fase      | Criterio                                                                        | Peso  | Estado      |
|-----------|---------------------------------------------------------------------------------|-------|-------------|
| discover  | Archivos modal y tabs listados en proposal.md                                   | 10 %  | completado  |
| discover  | Convenciones de componentes UI y eventos documentadas                           | 5 %   | completado  |
| design    | Estructura DOM del modal y semantica de tabs definida en design.md              | 15 %  | completado  |
| design    | Comportamiento de focus trap y teclas documentado en design.md                   | 10 %  | completado  |
| design    | design.md aprobado por revisor antes de comenzar fase test                      | 5 %   | completado  |
| test      | Tests de modal y tabs escritos y en rojo antes de implementar                   | 15 %  | completado  |
| test      | Tests cubren apertura, cierre Escape y navegacion por teclado entre tabs        | 10 %  | completado  |
| test      | Cada acceptance criterion tiene al menos un test nombrado                       | 10 %  | completado  |
| implement | Implementacion minimal sin codigo fuera del plan de diseno                      | 10 %  | completado  |
| implement | bun test tests/ui/modal.test.ts y tests/ui/tabs.test.ts pasan en verde          | 10 %  | completado  |
| review    | Cero findings CRITICAL en Review Report                                         | 10 %  | completado  |
| review    | npx cc-codeconductor openspec validate pasa sin errores                         | 5 %   | completado  |

OpenSpec folder: openspec/changes/bc-006-modal-con-tabs-feedback-y-contacto/

### BC-005 | Boton flotante configurable

- Priority: P1
- Status: DONE
- Type: feature
- Owner: implementer
- Depends on: BC-004
- Description: Implementar el boton flotante de activacion del widget con posicion configurable en las cuatro esquinas y estilos derivados de la configuracion data-feedback.
- Scope: src/ui/trigger-button.ts, src/ui/styles.ts, tests/ui/trigger-button.test.ts
- Out of scope: modal, formularios, animaciones Three.js, envio API
- Business value: punto de entrada visible y personalizable para el usuario final del sitio host
- Acceptance:
  - [x] El boton se renderiza en bottom-left, bottom-right, top-left o top-right segun data-position
  - [x] El color de fondo del boton respeta data-primary-color de la configuracion
  - [x] Los estilos estan encapsulados y no contaminan estilos globales del sitio host
  - [x] El boton es accesible con aria-label y responde a Enter y Space
  - [x] Tests verifican posicionamiento y aplicacion de color primario
- Risks: z-index insuficiente puede ocultar el boton detras de elementos del host
- Progress: 100%
- Reviewer: reviewer
- Last update: 2026-08-10

#### Scorecard BC-005

| Fase      | Criterio                                                                        | Peso  | Estado      |
|-----------|---------------------------------------------------------------------------------|-------|-------------|
| discover  | Archivos de UI del boton listados en proposal.md                                | 10 %  | completado  |
| discover  | Convenciones de encapsulacion de estilos documentadas                         | 5 %   | completado  |
| design    | Mapa de posiciones CSS y tokens de color definidos en design.md antes de tests  | 15 %  | completado  |
| design    | Requisitos de accesibilidad del boton explicitos en design.md                   | 10 %  | completado  |
| design    | design.md aprobado por revisor antes de comenzar fase test                      | 5 %   | completado  |
| test      | Tests de trigger-button escritos y en rojo antes de implementar                 | 15 %  | completado  |
| test      | Tests cubren las cuatro posiciones y aplicacion de color primario               | 10 %  | completado  |
| test      | Cada acceptance criterion tiene al menos un test nombrado                       | 10 %  | completado  |
| implement | Implementacion minimal sin codigo fuera del plan de diseno                      | 10 %  | completado  |
| implement | bun test tests/ui/trigger-button.test.ts pasa en verde                          | 10 %  | completado  |
| review    | Cero findings CRITICAL en Review Report                                         | 10 %  | completado  |
| review    | npx cc-codeconductor openspec validate pasa sin errores                         | 5 %   | completado  |

OpenSpec folder: openspec/changes/bc-005-boton-flotante-configurable/

### BC-004 | Bootstrap del widget y carga diferida

- Priority: P0
- Status: DONE
- Type: feature
- Owner: implementer
- Depends on: BC-001, BC-003
- Description: Implementar el arranque del widget con carga diferida via script defer, auto-inicializacion al DOMContentLoaded cuando existe un elemento con atributo data-feedback.
- Scope: src/bootstrap.ts, src/index.ts, tests/bootstrap.test.ts
- Out of scope: formularios, modal, llamadas API, build de produccion
- Business value: integracion de una linea de script sin bloquear el parsing de la pagina host
- Acceptance:
  - [x] El widget se inicializa automaticamente al detectar un elemento [data-feedback] tras DOMContentLoaded
  - [x] La inicializacion es idempotente: un segundo intento sobre el mismo elemento no crea instancias duplicadas
  - [x] El script exporta una funcion initFeedbackWidget opcional para inicializacion manual
  - [x] Tests verifican auto-init y prevencion de doble instancia con DOM simulado
- Risks: conflictos con otros scripts que modifiquen el DOM al mismo tiempo
- Progress: 100%
- Reviewer: reviewer
- Last update: 2026-08-10

#### Scorecard BC-004

| Fase      | Criterio                                                                        | Peso  | Estado      |
|-----------|---------------------------------------------------------------------------------|-------|-------------|
| discover  | Archivos bootstrap e index listados en proposal.md                              | 10 %  | completado  |
| discover  | Convenciones de ciclo de vida del widget documentadas                           | 5 %   | completado  |
| design    | Flujo de auto-init y API publica definidos en design.md antes de tests           | 15 %  | completado  |
| design    | Regla de idempotencia por elemento host explicita en design.md                  | 10 %  | completado  |
| design    | design.md aprobado por revisor antes de comenzar fase test                      | 5 %   | completado  |
| test      | Tests de bootstrap escritos y en rojo antes de implementar                      | 15 %  | completado  |
| test      | Tests cubren auto-init, init manual y prevencion de doble instancia             | 10 %  | completado  |
| test      | Cada acceptance criterion tiene al menos un test nombrado                       | 10 %  | completado  |
| implement | Implementacion minimal sin codigo fuera del plan de diseno                      | 10 %  | completado  |
| implement | bun test tests/bootstrap.test.ts pasa en verde                                  | 10 %  | completado  |
| review    | Cero findings CRITICAL en Review Report                                         | 10 %  | completado  |
| review    | npx cc-codeconductor openspec validate pasa sin errores                         | 5 %   | completado  |

OpenSpec folder: openspec/changes/bc-004-bootstrap-del-widget-y-carga-diferida/

### BC-003 | Contrato de configuracion data-feedback

- Priority: P0
- Status: DONE
- Type: feature
- Owner: architect
- Depends on: BC-001
- Description: Definir el contrato de configuracion del widget mediante atributos data-feedback en el elemento host, con parser tipado y valores por defecto documentados.
- Scope: src/config/types.ts, src/config/parse.ts, tests/config/parse.test.ts
- Out of scope: renderizado UI, llamadas HTTP, animaciones Three.js
- Business value: frontera de configuracion que permite cero setup complejo para el desarrollador integrador
- Acceptance:
  - [x] Parser lee data-api-key, data-base-url, data-source, data-position, data-primary-color, data-accent-color, data-locale, data-animation y data-z-index
  - [x] data-base-url por defecto es https://api.appsutiles.dev cuando no se especifica
  - [x] data-position acepta bottom-left, bottom-right, top-left, top-right y alias left-bottom y right-bottom
  - [x] Valores invalidos de color o posicion usan defaults documentados sin lanzar excepcion
  - [x] Tests cubren configuracion minima, completa y valores invalidos
- Risks: contrato incompleto obliga a retrabajo en items de UI y API
- Progress: 100%
- Reviewer: reviewer
- Last update: 2026-08-10

#### Scorecard BC-003

| Fase      | Criterio                                                                        | Peso  | Estado      |
|-----------|---------------------------------------------------------------------------------|-------|-------------|
| discover  | Tabla de atributos data-feedback listada en proposal.md                          | 10 %  | completado  |
| discover  | Convenciones de nombres de atributos y tipos documentadas                       | 5 %   | completado  |
| design    | Contrato WidgetConfig definido en design.md antes de escribir tests               | 15 %  | completado  |
| design    | Mapeo de alias de posicion y defaults explicitos en design.md                   | 10 %  | completado  |
| design    | design.md aprobado por revisor antes de comenzar fase test                      | 5 %   | completado  |
| test      | Tests de parser escritos y en rojo antes de implementar                         | 15 %  | completado  |
| test      | Tests cubren defaults, alias de posicion y valores invalidos                      | 10 %  | completado  |
| test      | Cada acceptance criterion tiene al menos un test nombrado                       | 10 %  | completado  |
| implement | Implementacion minimal sin codigo fuera del plan de diseno                      | 10 %  | completado  |
| implement | bun test tests/config/parse.test.ts pasa en verde                               | 10 %  | completado  |
| review    | Cero findings CRITICAL en Review Report                                         | 10 %  | completado  |
| review    | npx cc-codeconductor openspec validate pasa sin errores                         | 5 %   | completado  |

OpenSpec folder: openspec/changes/bc-003-contrato-de-configuracion-data-feedback/

### BC-001 | Scaffolding Bun + TypeScript strict

- Priority: P0
- Status: DONE
- Type: feature
- Owner: implementer
- Depends on: none
- Description: Inicializar el proyecto ejecutable con Bun, TypeScript strict y la estructura de carpetas base del widget CDN.
- Scope: package.json, tsconfig.json, src/index.ts, carpetas src/config, src/ui, src/api, src/animations, .gitignore
- Out of scope: logica de negocio del widget, build de produccion, dependencias de Three.js
- Business value: sin proyecto ejecutable ningun otro item puede comenzar
- Acceptance:
  - [x] bun install && bun run typecheck ejecuta sin errores en un clon limpio
  - [x] tsconfig.json tiene strict true con target y module ESNext
  - [x] Existen las carpetas src/config, src/ui, src/api y src/animations con src/index.ts compilando
  - [x] .gitignore excluye node_modules, dist y archivos de entorno local
- Risks: ninguno relevante
- Progress: 100%
- Reviewer: reviewer
- Last update: 2026-08-10

#### Scorecard BC-001

| Fase      | Criterio                                                                        | Peso  | Estado      |
|-----------|---------------------------------------------------------------------------------|-------|-------------|
| discover  | Todos los archivos afectados listados en proposal.md                            | 10 %  | completado  |
| discover  | Convenciones TypeScript y Bun documentadas                                      | 5 %   | completado  |
| design    | Estructura de carpetas y scripts npm definidos en design.md antes de tests      | 15 %  | completado  |
| design    | Decisiones de runtime (Bun) y modulo ESNext explicitas en design.md             | 10 %  | completado  |
| design    | design.md aprobado por revisor antes de comenzar fase test                      | 5 %   | completado  |
| test      | Smoke test de typecheck escrito y en rojo antes de implementar                  | 15 %  | completado  |
| test      | Test verifica existencia de carpetas src/config, src/ui, src/api, src/animations | 10 %  | completado  |
| test      | Cada acceptance criterion tiene al menos un test nombrado                       | 10 %  | completado  |
| implement | Implementacion minimal sin codigo fuera del plan de diseno                      | 10 %  | completado  |
| implement | bun run typecheck pasa en verde despues de implementar                          | 10 %  | completado  |
| review    | Cero findings CRITICAL en Review Report                                         | 10 %  | completado  |
| review    | npx cc-codeconductor openspec validate pasa sin errores                         | 5 %   | completado  |

OpenSpec folder: openspec/changes/bc-001-scaffolding-bun-typescript-strict/

### BC-002 | Toolchain de calidad Biome bun test CI y openspec config

- Priority: P0
- Status: DONE
- Type: feature
- Owner: implementer
- Depends on: BC-001
- Description: Configurar linter y formatter Biome, definir bun test como runner oficial y montar GitHub Actions con typecheck, lint y tests.
- Scope: biome.json, .github/workflows/ci.yml, openspec/config.yaml, tests/smoke.test.ts
- Out of scope: tests de logica de negocio del widget, reglas de lint personalizadas mas alla del preset recomendado
- Business value: gate automatico de calidad para todas las fases siguientes
- Acceptance:
  - [x] bun test ejecuta al menos un smoke test en verde
  - [x] openspec/config.yaml declara test_runner bun en la seccion testing
  - [x] El workflow de CI corre install, typecheck, lint y test en push a main
  - [x] bun run lint ejecuta Biome sin errores en el codigo base
- Risks: ninguno relevante
- Progress: 100%
- Reviewer: reviewer
- Last update: 2026-08-10

#### Scorecard BC-002

| Fase      | Criterio                                                                        | Peso  | Estado      |
|-----------|---------------------------------------------------------------------------------|-------|-------------|
| discover  | Archivos de toolchain listados en proposal.md                                   | 10 %  | completado  |
| discover  | Convenciones de lint y CI documentadas                                          | 5 %   | completado  |
| design    | Configuracion de Biome y CI definida en design.md antes de tests                | 15 %  | completado  |
| design    | Estructura de openspec/config.yaml explicita en design.md                       | 10 %  | completado  |
| design    | design.md aprobado por revisor antes de comenzar fase test                      | 5 %   | completado  |
| test      | Smoke test escrito y en rojo antes de implementar toolchain                     | 15 %  | completado  |
| test      | Test verifica que bun test descubre tests/smoke.test.ts                         | 10 %  | completado  |
| test      | Cada acceptance criterion tiene al menos un test nombrado                       | 10 %  | completado  |
| implement | Implementacion minimal sin codigo fuera del plan de diseno                      | 10 %  | completado  |
| implement | bun test y bun run lint pasan en verde despues de implementar                 | 10 %  | completado  |
| review    | Cero findings CRITICAL en Review Report                                         | 10 %  | completado  |
| review    | npx cc-codeconductor openspec validate pasa sin errores                         | 5 %   | completado  |

OpenSpec folder: openspec/changes/bc-002-toolchain-de-calidad-biome-bun-test-ci-y-openspe/

<!-- Mover items completados aqui con Status DONE y Progress 100 por ciento -->
