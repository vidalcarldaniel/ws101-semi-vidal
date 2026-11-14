#!/usr/bin/env node
/**
 * Switches .env.local between the two supported backends:
 *
 *   npm run env:local  -> Docker Supabase (`npx supabase start`)  <- REQUIRED for the defense
 *   npm run env:cloud   -> Supabase Cloud (supabase.com)          <- no Docker needed
 */
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCES = {
  local: ".env.local.docker",
  cloud: ".env.cloud",
};

const mode = process.argv[2];
const file = SOURCES[mode];
if (!file) {
  console.error("Usage: npm run env:local   |   npm run env:cloud");
  process.exit(1);
}

const src = join(root, file);
if (!existsSync(src)) {
  console.error(`Missing ${file} in the project root.`);
  if (mode === "cloud") {
    console.error("");
    console.error("Set up the cloud backend once:");
    console.error("  1. copy .env.cloud.example  ->  .env.cloud");
    console.error("  2. fill in your Supabase Project URL + anon/publishable key");
    console.error("  3. run: npm run env:cloud");
  } else {
    console.error("Run `npx supabase start` once, then restore it with the values printed by `npx supabase status`.");
  }
  process.exit(1);
}

copyFileSync(src, join(root, ".env.local"));
const label =
  mode === "cloud" ? "Supabase CLOUD (supabase.com) - no Docker" : "local Docker Supabase (npx supabase start)";
console.log(`.env.local now points at: ${label}`);
console.log("Restart the dev server so it picks up the new values:  npm run dev");
console.log("Note: NEXT_PUBLIC_* values are inlined at BUILD time - run `npm run build` again after switching if you use the production server.");
