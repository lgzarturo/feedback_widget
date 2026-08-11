# Project Scaffolding Specification

## Purpose

Define el scaffolding mínimo ejecutable del widget CDN: Bun, TypeScript strict y estructura de carpetas base.

## Requirements

### Requirement: Typecheck ejecutable en clon limpio

El proyecto MUST permitir `bun install && bun run typecheck` sin errores en un clon limpio.

#### Scenario: Clon limpio con typecheck exitoso

- GIVEN un clon limpio del repositorio sin `node_modules`
- WHEN se ejecuta `bun install` seguido de `bun run typecheck`
- THEN el comando termina con código de salida 0

### Requirement: TypeScript strict con ESNext

El archivo `tsconfig.json` MUST tener `strict: true` y `target`/`module` configurados como `ESNext`.

#### Scenario: Lectura de tsconfig

- GIVEN el archivo `tsconfig.json` en la raíz del proyecto
- WHEN se lee `compilerOptions`
- THEN `strict` es `true` y `target` y `module` son `ESNext`

### Requirement: Estructura de carpetas src

El proyecto MUST contener las carpetas `src/config`, `src/ui`, `src/api` y `src/animations`, y `src/index.ts` MUST compilar sin errores.

#### Scenario: Carpetas requeridas existen

- GIVEN la raíz del proyecto
- WHEN se verifica el árbol `src/`
- THEN existen los directorios `config`, `ui`, `api` y `animations`

#### Scenario: Entry point compila

- GIVEN `src/index.ts` exporta una constante
- WHEN se importa desde un test
- THEN la importación resuelve sin error de compilación

### Requirement: Gitignore de artefactos locales

El archivo `.gitignore` MUST excluir `node_modules`, `dist` y archivos de entorno local (`.env`, `.env.*`).

#### Scenario: Patrones de exclusión

- GIVEN el archivo `.gitignore` en la raíz
- WHEN se lee su contenido
- THEN incluye patrones para `node_modules`, `dist` y archivos `.env` locales
