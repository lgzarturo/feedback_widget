import { readFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const MAX_GZIP_BYTES = 204_800;
const bundlePath = "./dist/feedback.min.js";

const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  outdir: "./dist",
  naming: {
    entry: "feedback.min.[ext]",
    chunk: "[name].[ext]",
    asset: "[name].[ext]",
  },
  format: "iife",
  minify: true,
  sourcemap: "linked",
  target: "browser",
});

if (!result.success) {
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

const bundle = readFileSync(bundlePath);
const gzipSize = gzipSync(bundle).length;
console.log(`Bundle: ${bundlePath}`);
console.log(`Gzip size: ${gzipSize} bytes (max ${MAX_GZIP_BYTES})`);

if (gzipSize >= MAX_GZIP_BYTES) {
  console.error(`Bundle exceeds gzip limit: ${gzipSize} >= ${MAX_GZIP_BYTES}`);
  process.exit(1);
}
