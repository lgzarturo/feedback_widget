# Design: Microanimaciones Three.js

**Status:** Aprobado — listo para fase test.

## Approach

Modulos de animacion desacoplados en `src/animations/` con API pura testeable. El modal y los formularios invocan controllers/funciones sin conocer detalles de Three.js. Degradacion en cascada: `shouldPlayAnimations` → `isWebGLAvailable` → Three.js o CSS fallback.

## Politica de animaciones

| Condicion | Resultado |
|-----------|-----------|
| `config.animation === "off"` | Sin animacion (inmediato) |
| `prefers-reduced-motion: reduce` | Sin animacion (inmediato) |
| WebGL disponible + animation on | Three.js microanimacion |
| WebGL no disponible + animation on | Fallback CSS |
| Error al crear WebGLRenderer | Fallback CSS silencioso |

## API publica

```typescript
// src/animations/capabilities.ts
export function shouldPlayAnimations(config: WidgetConfig): boolean;
export function isWebGLAvailable(): boolean;

// src/animations/modal-scene.ts
export interface ModalAnimationController {
  playOpen(): Promise<void>;
  playClose(): Promise<void>;
  dispose(): void;
}
export function createModalAnimationController(
  config: WidgetConfig,
  dialog: HTMLElement,
): ModalAnimationController;

// src/animations/validation-fx.ts
export function playValidationErrorFx(config: WidgetConfig, target: HTMLElement): void;
```

## Duraciones

| Evento | Duracion | Fallback CSS |
|--------|----------|--------------|
| Modal abre | 300ms | scale 0.95→1, opacity 0→1 |
| Modal cierra | 150ms | scale 1→0.95, opacity 1→0 |
| Error validacion | 200ms | keyframes shake |

## Escena Three.js (modal)

- Canvas overlay posicionado sobre el dialog (`position: absolute`, `pointer-events: none`)
- Geometria minima: `TorusGeometry` o particulas simples con `Points`
- `WebGLRenderer` con alpha transparente
- `dispose()` limpia renderer, RAF y nodos DOM

## Efecto validacion

- Clase `.fw-validation-shake` con keyframes CSS (baseline siempre disponible)
- Con WebGL: canvas hijo temporal en el field (200ms, auto-remove)
- Idempotente: no acumular listeners en errores repetidos

## Integracion UI

### modal.ts

1. Crear `createModalAnimationController(config, dialog)` al instanciar modal
2. `open()`: mostrar overlay, `await playOpen()`
3. `close()`: `await playClose()`, luego ocultar overlay

### feedback-form.ts

En `submit()` cuando falla validacion: `playValidationErrorFx(config, radiogroup)`

### contact-form.ts

En `setFieldError()` cuando `message` no es null: `playValidationErrorFx(config, input)`

## Files Affected

| Archivo | Accion |
|---------|--------|
| `src/animations/capabilities.ts` | crear |
| `src/animations/modal-scene.ts` | crear |
| `src/animations/validation-fx.ts` | crear |
| `src/animations/index.ts` | modificar |
| `src/ui/modal.ts` | modificar |
| `src/ui/feedback-form.ts` | modificar |
| `src/ui/contact-form.ts` | modificar |
| `tests/animations/modal-scene.test.ts` | crear |
| `tests/animations/validation-fx.test.ts` | crear |

## Acceptance Criteria

- [x] Al abrir el modal se reproduce una animacion de entrada cuando data-animation es on
- [x] Al cerrar el modal se reproduce una animacion de salida cuando data-animation es on
- [x] Los errores de validacion de formulario muestran un efecto visual breve en el campo afectado
- [x] Si WebGL no esta disponible el widget funciona sin animaciones y sin errores en consola
- [x] data-animation off desactiva todas las animaciones Three.js
- [x] Tests verifican activacion, desactivacion y fallback sin WebGL

## Out of scope

Animaciones complejas 3D, particulas personalizadas, CDN externo, build/tree-shaking (BC-011), montaje formularios en bootstrap.
