export function createThreeModuleMock(options?: { failRenderer?: boolean }) {
  const failRenderer = options?.failRenderer ?? false;

  return {
    WebGLRenderer: failRenderer
      ? class FailingWebGLRenderer {
          constructor() {
            throw new Error("WebGLRenderer init failed");
          }
        }
      : class MockWebGLRenderer {
          setPixelRatio(): void {}
          setSize(): void {}
          render(): void {}
          dispose(): void {}
          setClearColor(): void {}
          clear(): void {}
        },
    Scene: class MockScene {
      add(): void {}
    },
    PerspectiveCamera: class MockCamera {
      position = { z: 0 };
    },
    TorusGeometry: class MockGeometry {},
    MeshBasicMaterial: class MockMaterial {},
    Mesh: class MockMesh {
      rotation = { x: 0, y: 0 };
    },
  };
}
