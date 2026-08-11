import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const projectRoot = join(import.meta.dir, "../..");
const playgroundDir = join(projectRoot, "playground");
const packageJsonPath = join(projectRoot, "package.json");
const readmePath = join(projectRoot, "README.md");

function readPlaygroundFile(name: string): string {
  const filePath = join(playgroundDir, name);
  expect(existsSync(filePath)).toBe(true);
  return readFileSync(filePath, "utf-8");
}

describe("BC-012 playground", () => {
  test("given_package_json_when_read_then_has_playground_script", () => {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as {
      scripts?: Record<string, string>;
    };

    expect(packageJson.scripts?.playground).toBeDefined();
    expect(packageJson.scripts?.playground).toContain("Bun.serve");
    expect(packageJson.scripts?.playground).toContain("3456");
  });

  test("given_playground_files_when_read_then_index_loads_dist_bundle", () => {
    const indexHtml = readPlaygroundFile("index.html");

    expect(indexHtml).toMatch(/dist\/feedback\.min\.js/);
    expect(indexHtml).toMatch(/data-feedback/);
    expect(indexHtml).toMatch(/controls\.js/);
  });

  test("given_controls_js_when_read_then_has_position_selector", () => {
    const controlsJs = readPlaygroundFile("controls.js");

    expect(controlsJs).toMatch(/ctrl-position/);
    expect(controlsJs).toMatch(/data-position/);
    expect(controlsJs).toMatch(/bottom-right/);
    expect(controlsJs).toMatch(/bottom-left/);
    expect(controlsJs).toMatch(/top-right/);
    expect(controlsJs).toMatch(/top-left/);
    expect(controlsJs).toMatch(/fw-trigger-host/);
  });

  test("given_controls_js_when_read_then_has_primary_and_accent_color_inputs", () => {
    const controlsJs = readPlaygroundFile("controls.js");

    expect(controlsJs).toMatch(/ctrl-primary-color/);
    expect(controlsJs).toMatch(/ctrl-accent-color/);
    expect(controlsJs).toMatch(/data-primary-color/);
    expect(controlsJs).toMatch(/data-accent-color/);
  });

  test("given_index_html_when_read_then_documents_feedback_and_contacto_tabs", () => {
    const indexHtml = readPlaygroundFile("index.html");

    expect(indexHtml).toMatch(/Feedback/i);
    expect(indexHtml).toMatch(/Contacto/i);
  });

  test("given_readme_when_read_then_documents_playground_command", () => {
    const readme = readFileSync(readmePath, "utf-8");

    expect(readme).toMatch(/bun run playground/);
    expect(readme).toMatch(/localhost:3456/);
  });

  test("given_env_example_when_read_then_has_playground_api_key_placeholder", () => {
    const envExamplePath = join(projectRoot, ".env.example");
    expect(existsSync(envExamplePath)).toBe(true);

    const envExample = readFileSync(envExamplePath, "utf-8");
    expect(envExample).toMatch(/PLAYGROUND_API_KEY/);
  });

  test("given_playground_script_when_spawned_then_server_starts", async () => {
    if (process.env.BC012_NESTED) {
      expect(true).toBe(true);
      return;
    }

    const proc = Bun.spawn(["bun", "run", "playground"], {
      cwd: projectRoot,
      stdout: "pipe",
      stderr: "pipe",
      env: { ...process.env, BC012_NESTED: "1" },
    });

    const decoder = new TextDecoder();
    let output = "";

    const readOutput = async (): Promise<void> => {
      const reader = proc.stdout.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        output += decoder.decode(value);
        if (output.includes("localhost:3456")) {
          break;
        }
      }
    };

    const timeout = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error("Playground server did not start in time")), 30_000);
    });

    try {
      await Promise.race([readOutput(), timeout]);
      expect(output).toContain("localhost:3456");
    } finally {
      proc.kill();
      await proc.exited;
    }
  });
});
