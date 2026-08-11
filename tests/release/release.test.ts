import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

  test("given_changelog_file_when_read_then_has_unreleased_header", () => {
    const changelogContent = readFileSync(changelogPath, "utf-8");

    expect(changelogContent).toContain("# CHANGELOG");
    expect(changelogContent).toContain("## [Unreleased]");
  });
});
