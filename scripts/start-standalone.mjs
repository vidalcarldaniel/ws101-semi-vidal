#!/usr/bin/env node
/**
 * Production server runner for `output: "standalone"`.
 * `next start` refuses to run with standalone output, so this script copies
 * the static assets next to the standalone server (same steps the Dockerfile
 * performs) and then launches it.
 */
import { cpSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const standalone = join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  console.error("No standalone build found. Run `npm run build` first.");
  process.exit(1);
}

cpSync(join(root, ".next", "static"), join(standalone, ".next", "static"), { recursive: true });
if (existsSync(join(root, "public"))) {
  cpSync(join(root, "public"), join(standalone, "public"), { recursive: true });
}

// Port 3000 is intentionally avoided: another local app (OJT Management
// System) uses it. Momentum standardises on 3001 (override with PORT).
const port = process.env.PORT || "3001";
const child = spawn(process.execPath, [join(standalone, "server.js")], {
  stdio: "inherit",
  env: { ...process.env, PORT: port, HOSTNAME: process.env.HOSTNAME || "0.0.0.0" },
});
child.on("exit", (code) => process.exit(code ?? 0));
