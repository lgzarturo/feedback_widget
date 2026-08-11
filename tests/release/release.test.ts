import { describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { syncVersionReferences } from "../../scripts/release";

describe("release script & package.json scripts", () => {
  const rootDir = resolve(import.meta.dir, "../..");
  const packageJsonPath = resolve(rootDir, "package.json");
  const releaseScriptPath = resolve(rootDir, "scripts/release.ts");
  const changelogPath = resolve(rootDir, "CHANGELOG.md");

  test("given_package_json_when_read_then_has_release_scripts", () => {
    const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

    expect(pkg.scripts.release).toBe("bun run scripts/release.ts");
    expect(pkg.scripts["release:patch"]).toBe("bun run scripts/release.ts patch");
    expect(pkg.scripts["release:minor"]).toBe("bun run scripts/release.ts minor");
    expect(pkg.scripts["release:major"]).toBe("bun run scripts/release.ts major");
  });

  test("given_release_script_file_when_read_then_exists_and_implements_semver", () => {
    const scriptContent = readFileSync(releaseScriptPath, "utf-8");

    expect(scriptContent).toContain('releaseType === "major"');
    expect(scriptContent).toContain('releaseType === "minor"');
    expect(scriptContent).toContain('releaseType === "patch"');
    expect(scriptContent).toContain("git add -f");
    expect(scriptContent).toContain("CHANGELOG.md");
  });

  test("given_release_script_when_read_then_exports_syncVersionReferences", () => {
    const scriptContent = readFileSync(releaseScriptPath, "utf-8");

    expect(scriptContent).toContain("export function syncVersionReferences");
    expect(scriptContent).toContain("package.json");
    expect(scriptContent).toContain("FEEDBACK_WIDGET_VERSION");
    expect(scriptContent).toContain("src/index.ts");
    expect(scriptContent).toContain("syncVersionReferences(rootDir, newVersion)");
  });

  test("given_changelog_file_when_read_then_has_unreleased_header", () => {
    const changelogContent = readFileSync(changelogPath, "utf-8");

    expect(changelogContent).toContain("# CHANGELOG");
    expect(changelogContent).toContain("## [Unreleased]");
  });

  test("given_temp_project_when_syncVersionReferences_then_updates_package_and_index", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "fw-release-sync-"));
    mkdirSync(join(tempRoot, "src"), { recursive: true });

    writeFileSync(
      join(tempRoot, "package.json"),
      `${JSON.stringify({ name: "tmp", version: "0.0.0" }, null, 2)}\n`,
      "utf-8",
    );
    writeFileSync(
      join(tempRoot, "src/index.ts"),
      'export const FEEDBACK_WIDGET_VERSION = "0.0.0";\n',
      "utf-8",
    );

    syncVersionReferences(tempRoot, "2.3.4");

    const pkg = JSON.parse(readFileSync(join(tempRoot, "package.json"), "utf-8")) as {
      version: string;
    };
    const indexTs = readFileSync(join(tempRoot, "src/index.ts"), "utf-8");

    expect(pkg.version).toBe("2.3.4");
    expect(indexTs).toContain('export const FEEDBACK_WIDGET_VERSION = "2.3.4";');
  });

  test("given_missing_version_export_when_syncVersionReferences_then_throws", () => {
    const tempRoot = mkdtempSync(join(tmpdir(), "fw-release-sync-fail-"));
    mkdirSync(join(tempRoot, "src"), { recursive: true });

    writeFileSync(
      join(tempRoot, "package.json"),
      `${JSON.stringify({ name: "tmp", version: "0.0.0" }, null, 2)}\n`,
      "utf-8",
    );
    writeFileSync(join(tempRoot, "src/index.ts"), "export const OTHER = 1;\n", "utf-8");

    expect(() => syncVersionReferences(tempRoot, "9.9.9")).toThrow(/FEEDBACK_WIDGET_VERSION/);
  });
});
