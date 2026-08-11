# Toolchain Quality Specification

## Purpose

Define el gate automatico de calidad: Biome lint/format, bun test como runner oficial, CI en GitHub Actions y configuracion OpenSpec.

## Requirements

### Requirement: Smoke test ejecutable con bun test

El proyecto MUST ejecutar al menos un smoke test en verde con `bun test`.

#### Scenario: bun test descubre tests/smoke.test.ts

- GIVEN el archivo `tests/smoke.test.ts` existe
- WHEN se ejecuta `bun test tests/smoke.test.ts`
- THEN el comando termina con codigo de salida 0

### Requirement: OpenSpec declara bun como test runner

El archivo `openspec/config.yaml` MUST declarar `test_runner: bun` en la seccion `testing`.

#### Scenario: Lectura de openspec config

- GIVEN el archivo `openspec/config.yaml` en la raiz del proyecto
- WHEN se lee la seccion `testing`
- THEN `test_runner` es `bun`

### Requirement: CI ejecuta install, typecheck, lint y test en push a main

El workflow `.github/workflows/ci.yml` MUST ejecutar install, typecheck, lint y test en push a la rama `main`.

#### Scenario: Workflow CI con pasos de calidad

- GIVEN el archivo `.github/workflows/ci.yml` existe
- WHEN se lee su contenido
- THEN dispara en `push` a `main` y contiene pasos para install, typecheck, lint y test

### Requirement: Biome lint sin errores en codigo base

El comando `bun run lint` MUST ejecutar Biome sin errores en el codigo base del proyecto.

#### Scenario: Lint exitoso

- GIVEN el codigo base del repositorio
- WHEN se ejecuta `bun run lint`
- THEN el comando termina con codigo de salida 0
