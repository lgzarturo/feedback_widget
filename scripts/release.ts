import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type ReleaseType = "major" | "minor" | "patch";

const FEEDBACK_WIDGET_VERSION_PATTERN = /export const FEEDBACK_WIDGET_VERSION = "[^"]+";/;

/**
 * Sincroniza todas las referencias de versión de producto conocidas.
 * Fuente de verdad: package.json → también actualiza FEEDBACK_WIDGET_VERSION.
 */
export function syncVersionReferences(rootDir: string, newVersion: string): void {
  const packageJsonPath = resolve(rootDir, "package.json");
  const indexTsPath = resolve(rootDir, "src/index.ts");

  const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as {
    version: string;
    [key: string]: unknown;
  };
  pkg.version = newVersion;
  writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf-8");
  console.log(`📦 package.json actualizado a v${newVersion}.`);

  const indexTsContent = readFileSync(indexTsPath, "utf-8");
  const updatedIndexTs = indexTsContent.replace(
    FEEDBACK_WIDGET_VERSION_PATTERN,
    `export const FEEDBACK_WIDGET_VERSION = "${newVersion}";`,
  );
  if (updatedIndexTs === indexTsContent) {
    throw new Error(
      `No se encontró FEEDBACK_WIDGET_VERSION en ${indexTsPath}. Abortando sincronización.`,
    );
  }
  writeFileSync(indexTsPath, updatedIndexTs, "utf-8");
  console.log(`📌 src/index.ts actualizado a v${newVersion}.`);
}

function runRelease(releaseType: ReleaseType): void {
  const rootDir = resolve(import.meta.dir, "..");
  const packageJsonPath = resolve(rootDir, "package.json");
  const changelogPath = resolve(rootDir, "CHANGELOG.md");

  // 1. Leer package.json actual
  const pkg = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as {
    version: string;
  };
  const currentVersion = pkg.version;
  const [major, minor, patch] = currentVersion.split(".").map(Number);

  let newVersion = "";
  if (releaseType === "major") {
    newVersion = `${major + 1}.0.0`;
  } else if (releaseType === "minor") {
    newVersion = `${major}.${minor + 1}.0`;
  } else if (releaseType === "patch") {
    newVersion = `${major}.${minor}.${patch + 1}`;
  }

  const tagName = `v${newVersion}`;
  console.log(`🚀 Iniciando release ${releaseType}: v${currentVersion} ➔ ${tagName}`);

  // 2. Obtener la referencia de git anterior (último tag o primer commit)
  let lastTag = "";
  try {
    lastTag = execSync("git describe --tags --abbrev=0", {
      encoding: "utf-8",
    }).trim();
  } catch {
    // Si no hay tags previos, se obtiene el primer commit
    lastTag = execSync("git rev-list --max-parents=0 HEAD", {
      encoding: "utf-8",
    }).trim();
  }

  const range = lastTag ? `${lastTag}..HEAD` : "HEAD";
  const gitLogRaw = execSync(`git log ${range} --pretty=format:"%s|%h"`, {
    encoding: "utf-8",
  }).trim();

  const categorizedCommits: Record<string, string[]> = {
    feat: [],
    fix: [],
    docs: [],
    style: [],
    refactor: [],
    test: [],
    chore: [],
    perf: [],
    other: [],
  };

  if (gitLogRaw) {
    const lines = gitLogRaw.split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      const [subject, hash] = line.split("|");
      const match = subject.match(/^([a-z]+)(\(.*\))?: (.*)$/i);

      if (match) {
        const type = match[1].toLowerCase();
        const desc = match[3];
        const entry = `- ${desc} (\`${hash}\`)`;
        if (categorizedCommits[type]) {
          categorizedCommits[type].push(entry);
        } else {
          categorizedCommits.other.push(`- ${subject} (\`${hash}\`)`);
        }
      } else {
        categorizedCommits.other.push(`- ${subject} (\`${hash}\`)`);
      }
    }
  }

  // 3. Formatear la sección del CHANGELOG
  const dateStr = new Date().toISOString().split("T")[0];
  let changelogSection = `## [${newVersion}] - ${dateStr}\n\n`;

  const sectionTitles: Record<string, string> = {
    feat: "### Característica / Features 🚀",
    fix: "### Correcciones / Bug Fixes 🐛",
    docs: "### Documentación 📚",
    style: "### Estilo & UI 🎨",
    refactor: "### Refactorización ♻️",
    perf: "### Rendimiento ⚡",
    test: "### Pruebas 🧪",
    chore: "### Tareas / Chores 🔧",
    other: "### Otros Cambios",
  };

  let hasEntries = false;
  for (const [type, entries] of Object.entries(categorizedCommits)) {
    if (entries.length > 0) {
      hasEntries = true;
      changelogSection += `${sectionTitles[type]}\n\n${entries.join("\n")}\n\n`;
    }
  }

  if (!hasEntries) {
    changelogSection += "- Actualización de versión sin cambios documentados adicionales.\n\n";
  }

  // Actualizar CHANGELOG.md
  let changelogContent = readFileSync(changelogPath, "utf-8");
  if (changelogContent.includes("## [Unreleased]")) {
    changelogContent = changelogContent.replace(
      "## [Unreleased]\n",
      `## [Unreleased]\n\n${changelogSection}`,
    );
  } else {
    changelogContent = `# CHANGELOG — Feedback Widget CDN\n\n## [Unreleased]\n\n${changelogSection}${changelogContent}`;
  }

  writeFileSync(changelogPath, changelogContent, "utf-8");
  console.log("📝 CHANGELOG.md actualizado con éxito.");

  // 4–5. Sincronizar todas las referencias de versión de producto
  syncVersionReferences(rootDir, newVersion);

  // 6. Ejecutar comprobaciones y build (dist/ hereda la versión vía build)
  console.log("🛠️ Ejecutando formateador y build de producción...");
  execSync("bun run lint:fix", { stdio: "inherit" });
  execSync("bun run build", { stdio: "inherit" });

  // 7. Realizar git commit y tag
  console.log(`💾 Creando commit y tag de versión ${tagName}...`);
  execSync("git add -f package.json src/index.ts CHANGELOG.md dist/", {
    stdio: "inherit",
  });
  const commitMsg = `chore(release): publicar version ${tagName}`;
  execSync(`git commit -m "${commitMsg}"`, { stdio: "inherit" });
  execSync(`git tag -a ${tagName} -m "Release ${tagName}"`, {
    stdio: "inherit",
  });

  console.log(`✅ ¡Release ${tagName} completado exitosamente!`);
}

if (import.meta.main) {
  const releaseType = process.argv[2] as ReleaseType;

  if (!["major", "minor", "patch"].includes(releaseType)) {
    console.error(
      "❌ Error: Se requiere especificar el tipo de versionamiento: major, minor o patch.",
    );
    console.error("Uso: bun run scripts/release.ts <major|minor|patch>");
    process.exit(1);
  }

  runRelease(releaseType);
}
