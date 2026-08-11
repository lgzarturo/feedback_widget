import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { FEEDBACK_WIDGET_VERSION } from "../src/index";

const projectRoot = join(import.meta.dir, "..");

describe("BC-001 scaffolding", () => {
  test("given_clean_clone_when_bun_install_and_typecheck_then_exits_zero", () => {
    const install = Bun.spawnSync(["bun", "install"], {
      cwd: projectRoot,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(install.exitCode).toBe(0);

    const typecheck = Bun.spawnSync(["bun", "run", "typecheck"], {
      cwd: projectRoot,
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(typecheck.exitCode).toBe(0);
  });

  test("given_tsconfig_when_read_then_strict_and_esnext", () => {
    const tsconfigPath = join(projectRoot, "tsconfig.json");
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8")) as {
      compilerOptions: { strict?: boolean; target?: string; module?: string };
    };

    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.target).toBe("ESNext");
    expect(tsconfig.compilerOptions.module).toBe("ESNext");
  });

  test("given_src_tree_when_checked_then_required_folders_exist", () => {
    const requiredFolders = ["config", "ui", "api", "animations"];

    for (const folder of requiredFolders) {
      expect(existsSync(join(projectRoot, "src", folder))).toBe(true);
    }
  });

  test("given_src_index_when_imported_then_compiles_without_error", () => {
    expect(FEEDBACK_WIDGET_VERSION).toBe("0.0.0");
  });

  test("given_gitignore_when_read_then_ignores_node_modules_dist_and_env", () => {
    const gitignore = readFileSync(join(projectRoot, ".gitignore"), "utf-8");

    expect(gitignore).toMatch(/node_modules/);
    expect(gitignore).toMatch(/dist/);
    expect(gitignore).toMatch(/\.env/);
  });
});
