export const originalGetContext = HTMLCanvasElement.prototype.getContext;

export function mockWebGLAvailable(): void {
  HTMLCanvasElement.prototype.getContext = ((type: string) => {
    if (type === "webgl" || type === "experimental-webgl") {
      return {} as WebGLRenderingContext;
    }
    return originalGetContext.call(document.createElement("canvas"), type);
  }) as typeof HTMLCanvasElement.prototype.getContext;
}

export function mockWebGLUnavailable(): void {
  HTMLCanvasElement.prototype.getContext = (() =>
    null) as typeof HTMLCanvasElement.prototype.getContext;
}

export function mockGetContextThrows(): void {
  HTMLCanvasElement.prototype.getContext = (() => {
    throw new Error("getContext failed");
  }) as typeof HTMLCanvasElement.prototype.getContext;
}

export function restoreGetContext(): void {
  HTMLCanvasElement.prototype.getContext = originalGetContext;
}
