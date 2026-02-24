import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildSync } from "esbuild";

const projectRoot = process.cwd();
const openNextDir = path.join(projectRoot, ".open-next");
const serverHandlerPath = path.join(
  openNextDir,
  "server-functions",
  "default",
  "handler.mjs"
);
const pgBundledModulePath = "./pg-bundled.mjs";
const pgEntryCandidates = [
  path.join(projectRoot, "node_modules", "pg", "lib", "index.js"),
  path.join(
    openNextDir,
    "server-functions",
    "default",
    "node_modules",
    "pg",
    "lib",
    "index.js"
  ),
  path.join(
    openNextDir,
    "server-functions",
    "default",
    "node_modules",
    "pg",
    "esm",
    "index.mjs"
  ),
];

function collectPgExternalIds(workerSource) {
  const matches = workerSource.matchAll(/"((?:pg)-[a-f0-9]+)"/g);
  return [...new Set(Array.from(matches, (m) => m[1]))];
}

function resolvePgEntryPath() {
  for (const entryPath of pgEntryCandidates) {
    if (existsSync(entryPath)) {
      return entryPath;
    }
  }

  throw new Error(
    `[cf-build] Could not find a bundled pg entrypoint. Tried: ${pgEntryCandidates.join(
      ", "
    )}`
  );
}

function bundlePgEntrypoint(pgEntryPath) {
  const outputAbsPath = path.join(openNextDir, pgBundledModulePath);

  buildSync({
    entryPoints: [pgEntryPath],
    outfile: outputAbsPath,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "es2022",
    alias: {
      "pg-cloudflare": path.join(
        projectRoot,
        "node_modules",
        "pg-cloudflare",
        "dist",
        "index.js"
      ),
    },
    banner: {
      js: 'import { createRequire } from "node:module"; const require = createRequire("file:///worker.js");',
    },
    logLevel: "silent",
  });

  console.log(`[cf-build] Bundled pg entry: ${pgEntryPath} -> ${pgBundledModulePath}`);
}

function writePgShims(ids, pgModulePath) {
  if (!ids.length) {
    console.log("[cf-build] No pg external IDs found; no shims created.");
    return;
  }

  const shimSource = [
    `import pg from "${pgModulePath}";`,
    "export const Client = pg.Client;",
    "export const Pool = pg.Pool;",
    "export const Connection = pg.Connection;",
    "export const types = pg.types;",
    "export const Query = pg.Query;",
    "export const DatabaseError = pg.DatabaseError;",
    "export const escapeIdentifier = pg.escapeIdentifier;",
    "export const escapeLiteral = pg.escapeLiteral;",
    "export const Result = pg.Result;",
    "export const TypeOverrides = pg.TypeOverrides;",
    "export const defaults = pg.defaults;",
    "export default pg;",
    "",
  ].join("\n");

  for (const id of ids) {
    const shimPath = path.join(openNextDir, id);
    writeFileSync(shimPath, shimSource, "utf8");
    console.log(`[cf-build] Wrote pg shim: ${id}`);
  }
}

execSync("npx opennextjs-cloudflare build", { stdio: "inherit" });

const handlerSource = readFileSync(serverHandlerPath, "utf8");
const pgExternalIds = collectPgExternalIds(handlerSource);
const pgEntryPath = resolvePgEntryPath();
bundlePgEntrypoint(pgEntryPath);
writePgShims(pgExternalIds, pgBundledModulePath);
