import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const projectRoot = join(import.meta.dir, "..");

function runSmokeSelfTest(): void {
  if (process.env.BC002_NESTED) {
    expect(true).toBe(true);
    return;
  }

  const result = Bun.spawnSync(["bun", "test", "tests/smoke.test.ts"], {
    cwd: projectRoot,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, BC002_NESTED: "1" },
  });
  expect(result.exitCode).toBe(0);
}

describe("BC-002 toolchain", () => {
  test("given_bun_test_when_run_then_smoke_test_passes", () => {
    runSmokeSelfTest();
  });

  test("given_bc002_nested_env_when_smoke_self_test_then_skips_spawn", () => {
    const saved = process.env.BC002_NESTED;
    process.env.BC002_NESTED = "1";
    try {
      runSmokeSelfTest();
    } finally {
      if (saved === undefined) {
        process.env.BC002_NESTED = undefined;
      } else {
        process.env.BC002_NESTED = saved;
      }
    }
  });

  test("given_openspec_config_when_read_then_test_runner_is_bun", () => {
    const configPath = join(projectRoot, "openspec", "config.yaml");
    const config = readFileSync(configPath, "utf-8");

    expect(config).toMatch(/test_runner:\s*bun/);
  });

  test("given_ci_workflow_when_read_then_runs_install_typecheck_lint_test_on_main_push", () => {
    const workflowPath = join(projectRoot, ".github", "workflows", "ci.yml");
    expect(existsSync(workflowPath)).toBe(true);

    const workflow = readFileSync(workflowPath, "utf-8");

    expect(workflow).toMatch(/push/);
    expect(workflow).toMatch(/main/);
    expect(workflow).toMatch(/bun install/);
    expect(workflow).toMatch(/typecheck/);
    expect(workflow).toMatch(/lint/);
    expect(workflow).toMatch(/bun test/);
  });

  test("given_codebase_when_bun_run_lint_then_exits_zero", () => {
    const result = Bun.spawnSync(["bun", "run", "lint"], {
      cwd: projectRoot,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(result.exitCode).toBe(0);
  });
});

describe("smoke", () => {
  test("bun test runner está configurado", () => {
    expect(true).toBe(true);
  });

  test("happy-dom provee document", () => {
    expect(typeof document).toBe("object");
    const el = document.createElement("div");
    el.setAttribute("data-feedback", "");
    expect(el.hasAttribute("data-feedback")).toBe(true);
  });
});
