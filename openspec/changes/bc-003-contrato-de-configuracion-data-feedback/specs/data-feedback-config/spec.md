# Data Feedback Config Specification

## Purpose

Define el contrato de configuracion del widget mediante atributos `data-feedback` en el elemento host, con parser tipado y valores por defecto documentados.

## Requirements

### Requirement: Parser lee todos los atributos data-feedback

El parser `parseFeedbackConfig` MUST leer `data-api-key`, `data-base-url`, `data-source`, `data-position`, `data-primary-color`, `data-accent-color`, `data-locale`, `data-animation` y `data-z-index` del elemento host.

#### Scenario: Configuracion completa con todos los atributos

- GIVEN un elemento host con `data-feedback` y los nueve atributos de configuracion con valores validos
- WHEN se ejecuta `parseFeedbackConfig(host)`
- THEN retorna un `WidgetConfig` con todos los campos mapeados desde los atributos

### Requirement: Default de data-base-url

Cuando `data-base-url` no esta presente, el parser MUST usar `https://api.appsutiles.dev` como valor por defecto.

#### Scenario: Host sin data-base-url

- GIVEN un elemento host con solo `data-feedback`
- WHEN se ejecuta `parseFeedbackConfig(host)`
- THEN `baseUrl` es `https://api.appsutiles.dev`

### Requirement: Posiciones canonicas y alias

`data-position` MUST aceptar `bottom-left`, `bottom-right`, `top-left`, `top-right` y los alias `left-bottom` y `right-bottom` normalizados a su forma canonica.

#### Scenario: Posiciones canonicas

- GIVEN un elemento host con cada una de las cuatro posiciones canonicas
- WHEN se ejecuta `parseFeedbackConfig(host)`
- THEN `position` coincide con el valor canonico esperado

#### Scenario: Alias de posicion

- GIVEN un elemento host con `data-position="left-bottom"` o `data-position="right-bottom"`
- WHEN se ejecuta `parseFeedbackConfig(host)`
- THEN `position` es `bottom-left` o `bottom-right` respectivamente

### Requirement: Valores invalidos usan defaults sin excepcion

Valores invalidos de color o posicion MUST usar los defaults documentados sin lanzar excepcion.

#### Scenario: Posicion invalida

- GIVEN un elemento host con `data-position="center"`
- WHEN se ejecuta `parseFeedbackConfig(host)`
- THEN `position` es `bottom-right` y no se lanza excepcion

#### Scenario: Colores invalidos

- GIVEN un elemento host con `data-primary-color="red"` y `data-accent-color="not-a-color"`
- WHEN se ejecuta `parseFeedbackConfig(host)`
- THEN `primaryColor` es `#2563eb` y `accentColor` es `#1d4ed8` sin lanzar excepcion

### Requirement: Configuracion minima con defaults

El parser MUST retornar todos los defaults documentados cuando el host solo tiene `data-feedback`.

#### Scenario: Configuracion minima

- GIVEN un elemento host con solo el atributo `data-feedback`
- WHEN se ejecuta `parseFeedbackConfig(host)`
- THEN retorna `WidgetConfig` con todos los valores por defecto de la tabla de proposal
