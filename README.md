# Feedback Widget CDN 💬

Un widget de feedback ligero, altamente configurable y listo para incrustar en cualquier sitio web mediante CDN. 

El widget se integra fácilmente en sitios estáticos o aplicaciones web agregando un tag HTML con atributos `data-feedback-*`, permitiendo la captura de comentarios, puntuaciones e inquietudes de los usuarios con sincronización hacia la API central de AppsÚtiles.

---

## 🚀 Características Principales

- **Carga Diferida & Cero Bloqueo**: Se ejecuta de forma asíncrona mediante atributos `defer`, asegurando que la renderización de la página host no sufra impacto.
- **Configuración Declarativa vía HTML5 Dataset**: Personalización de estilos, posiciones, colores y parámetros API utilizando atributos `data-feedback-*` en el elemento host.
- **Soporte DOM Simulado**: Suite de pruebas basada en [Bun](https://bun.sh) y [Happy-DOM](https://github.com/capricorn86/happy-dom) para simulación realista de entornos del navegador.
- **Tipado Estricto & Calidad de Código**: Construido con **TypeScript (Strict Mode)** y formateado/analizado con **Biome**.
- **Desarrollo Guiado por Especificaciones (Spec-Driven Development + TDD)**: Flujo de trabajo basado en especificaciones formales con OpenSpec y metodología Red-Green-Refactor.

---

## 📦 Configuración y Atributos (`data-feedback-*`)

El widget lee la configuración automáticamente desde el elemento HTML host donde se ubique.

### Atributos Disponibles

| Atributo | Tipo | Descripción | Valor por Defecto |
| :--- | :--- | :--- | :--- |
| `data-api-key` | `string` | Clave de API para autenticación del cliente. | `""` |
| `data-base-url` | `string` | URL base de la API backend de feedback. | `"https://api.appsutiles.dev"` |
| `data-source` | `string` | Origen o identificador del módulo/sitio. | `""` |
| `data-position` | `string` | Posición del botón (`bottom-right`, `bottom-left`, `top-right`, `top-left`). | `"bottom-right"` |
| `data-primary-color` | `string` | Color primario en formato HEX (`#RRGGBB` o `#RGB`). | `"#2563eb"` |
| `data-accent-color` | `string` | Color secundario/acento en formato HEX. | `"#1d4ed8"` |
| `data-locale` | `string` | Idioma del widget (`es`, `en`, etc.). | `"es"` |
| `data-animation` | `string` | Estado de las animaciones UI (`on` / `off`). | `"on"` |
| `data-z-index` | `number` | Índice de capa CSS para superposición. | `9999` |

---

## Integración CDN (jsDelivr)

El widget se distribuye gratuitamente vía [jsDelivr](https://www.jsdelivr.com/) desde GitHub Releases. No requiere npm ni bundler en el sitio host.

### URL del script

```
https://cdn.jsdelivr.net/gh/lgzarturo/feedback_widget@VERSION/dist/feedback.min.js
```

Reemplaza `VERSION` por el tag semver deseado (por ejemplo `v1.0.0`).

| Versión | URL |
| :--- | :--- |
| Última estable (`v1.0.0`) | `https://cdn.jsdelivr.net/gh/lgzarturo/feedback_widget@v1.0.0/dist/feedback.min.js` |

Para actualizar, cambia solo el segmento `@vX.Y.Z` en la URL del script. Consulta [CHANGELOG.md](CHANGELOG.md) para el historial de versiones.

### Ejemplo de integración HTML

```html
<div
  data-feedback
  data-api-key="TU_API_KEY"
  data-source="mi-sitio"
  data-position="bottom-right"
  data-locale="es">
</div>
<script defer src="https://cdn.jsdelivr.net/gh/lgzarturo/feedback_widget@v1.0.0/dist/feedback.min.js"></script>
```

El atributo `defer` garantiza carga diferida sin bloquear el parsing del HTML host.

### Verificación manual con jsDelivr

Para confirmar que la URL CDN funciona antes de integrar en producción:

1. Abre `playground/index.html` y cambia temporalmente el `src` del script a la URL jsDelivr de arriba.
2. Ejecuta `bun run playground` y abre [http://localhost:3456](http://localhost:3456).
3. Verifica que el botón flotante aparece y el modal se abre correctamente.
4. Restaura el `src` local (`/dist/feedback.min.js`) cuando termines.

> **Nota:** jsDelivr puede tardar unos minutos en cachear un tag recién publicado.

---

## 🛠️ Desarrollo Local y Scripts

Este proyecto utiliza [Bun](https://bun.sh) como runtime, gestor de paquetes y ejecutor de pruebas.

### Requisitos Previos

- **Bun** >= 1.1.0

### Instalación

```bash
bun install
```

### Comandos Disponibles

| Comando | Descripción |
| :--- | :--- |
| `bun test` | Ejecuta la suite de pruebas unitarias y de integración. |
| `bun test:coverage` | Ejecuta las pruebas generando un reporte de cobertura de código. |
| `bun run typecheck` | Verifica el tipado estricto con TypeScript (`tsc --noEmit`). |
| `bun run lint` | Ejecuta el linter Biome en todo el proyecto. |
| `bun run lint:fix` | Corrige automágicamente errores de formato y estilo con Biome. |
| `bun run validate` | Valida el cumplimiento del estándar OpenSpec en el proyecto. |
| `bun run build` | Genera el bundle CDN `dist/feedback.min.js`. |
| `bun run playground` | Construye el bundle y sirve el playground local en `http://localhost:3456`. |

### Playground local

Entorno de demostración para probar el widget con controles en vivo (posición y colores) sin recargar la página.

```bash
bun run playground
```

Abre [http://localhost:3456](http://localhost:3456) en el navegador. El script ejecuta `bun run build` automáticamente antes de iniciar el servidor.

**Controles disponibles:**

- **Posición** — cambia `data-position` entre las cuatro esquinas
- **Color primario** — actualiza `data-primary-color` del botón flotante
- **Color acento** — actualiza `data-accent-color` de los botones de envío

Para pruebas con API real, copia `.env.example` a `.env` y configura `PLAYGROUND_API_KEY`. El HTML del playground usa un placeholder; no uses claves de producción en demos públicas.

---

## 🏗️ Arquitectura del Proyecto

```
feedback_widget/
├── .github/
│   └── workflows/
│       ├── ci.yml             # Workflow de integración continua (GitHub Actions)
│       └── release.yml        # Workflow de publicación en tags v*
├── openspec/                  # Especificaciones OpenSpec de cambios (proposal, design, specs)
├── src/
│   ├── animations/            # Lógica y estilos de animación
│   ├── api/                   # Cliente HTTP / API de feedback
│   ├── config/                # Parsing y tipado de atributos data-feedback-*
│   │   ├── index.ts
│   │   ├── parse.ts
│   │   └── types.ts
│   ├── ui/                    # Componentes UI / Shadow DOM
│   └── index.ts               # Punto de entrada principal
├── tests/                     # Suite de pruebas con Bun & Happy-DOM
│   ├── config/
│   │   └── parse.test.ts
│   ├── scaffolding.test.ts
│   ├── setup.ts
│   └── smoke.test.ts
├── BACKLOG.md                 # Backlog operativo y máquina de estados (BC-xxx)
├── biome.json                 # Configuración de Linter & Formatter
├── bunfig.toml                # Configuración del runtime Bun
├── package.json               # Dependencias y scripts
└── tsconfig.json              # Configuración de TypeScript en modo estricto
```

---

## 📋 Flujo de Trabajo (Spec-Driven Development + TDD)

Las contribuciones y nuevas características siguen el flujo **OpenSpec**:

1. **Diseño / Planificación**: Creación de proposal, design, tasks y specs en `openspec/changes/<slug>/`.
2. **Pruebas (TDD)**: Creación de pruebas unitarias en rojo (`red`) antes de la implementación.
3. **Implementación**: Desarrollo del código mínimo necesario para pasar las pruebas a verde (`green`).
4. **Refactor & Validación**: Limpieza de código y ejecución de `bun run validate` y `bun test`.

---

## 📄 Licencia

Propiedad privada de **AppsÚtiles**. Todos los derechos reservados.
