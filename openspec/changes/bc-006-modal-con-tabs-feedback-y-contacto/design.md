# Design: Modal con tabs feedback y contacto

**Status:** Aprobado — listo para fase test.

## Approach

Modulo `modal.ts` que crea un host `position: fixed` con Shadow DOM abierto, conteniendo overlay + dialog semantico. Integra `createTabs()` de `tabs.ts` para las pestanas Feedback y Contacto. El modal expone `open()`, `close()` e `isOpen()`. La integracion trigger→modal se verifica en tests componiendo `createTriggerButton(config, () => modal.open())` sin modificar bootstrap.

## Estructura DOM

```
fw-modal-host (fixed, shadow root, z-index: config.zIndex)
└── .fw-modal-overlay [hidden cuando cerrado]
    └── [role="dialog"][aria-modal="true"]
        ├── header
        │   ├── [role="tablist"]  ← createTabs()
        │   │   ├── [role="tab"] Feedback
        │   │   └── [role="tab"] Contacto
        │   └── button.fw-modal-close (aria-label="Cerrar")
        └── [role="tabpanel"] × 2 (placeholders vacios para BC-007/008)
```

## API publica

```typescript
// src/ui/tabs.ts
export type TabId = "feedback" | "contact";

export interface TabItem {
  id: TabId;
  label: string;
}

export interface TabsController {
  root: HTMLElement;
  getActiveTab(): TabId;
  setActiveTab(id: TabId): void;
}

export function createTabs(items: TabItem[], initialActive?: TabId): TabsController;
```

```typescript
// src/ui/modal.ts
export interface FeedbackModal {
  host: HTMLElement;
  open(): void;
  close(): void;
  isOpen(): boolean;
}

export function createFeedbackModal(config: WidgetConfig): FeedbackModal;
```

## Comportamiento de teclado (WAI-ARIA tabs)

| Tecla | Contexto | Accion |
|-------|----------|--------|
| `ArrowRight` / `ArrowLeft` | foco en tab | Mover foco y activar tab adyacente (roving `tabindex`) |
| `Enter` | foco en tab inactiva | Activar tab |
| `Escape` | modal abierto | Cerrar modal |
| `Tab` / `Shift+Tab` | modal abierto | Focus trap: ciclar entre elementos enfocables del modal |

## Focus trap basico

1. **Al abrir:** guardar `document.activeElement`, mostrar overlay, enfocar primera tab activa
2. **Mientras abierto:** listener `keydown` en el dialog — si `Tab` sale del ultimo/primer focuable, redirigir al otro extremo
3. **Al cerrar:** ocultar overlay (`hidden`), restaurar foco al elemento guardado

## Estilos

Funcion local `buildModalStyles(config)` en `modal.ts`. Usa `config.primaryColor` para acento de tab activa. Sin contaminacion de `document.head`.

## Files Affected

| Archivo | Accion |
|---------|--------|
| `src/ui/tabs.ts` | crear |
| `src/ui/modal.ts` | crear |
| `src/ui/index.ts` | modificar |
| `tests/ui/tabs.test.ts` | crear |
| `tests/ui/modal.test.ts` | crear |

## Acceptance Criteria

- [x] Clic en el boton flotante abre el modal; clic en cerrar o tecla Escape lo cierra
- [x] Existen dos tabs visibles: Feedback y Contacto
- [x] Las tabs son navegables con flechas izquierda y derecha y activables con Enter
- [x] El modal implementa focus trap basico mientras esta abierto
- [x] Tests verifican apertura, cierre y cambio de tab activa

## Out of scope

Formularios de feedback/contacto, animaciones Three.js, cliente API, integracion en `bootstrap.ts`
