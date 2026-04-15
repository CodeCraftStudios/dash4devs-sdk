/**
 * CLI config loader.
 *
 * Precedence (highest wins):
 *   1. process.env
 *   2. .env.local in cwd
 *   3. .env in cwd
 *
 * Not using dotenv to keep zero-dependency-at-runtime for this file;
 * the SDK already ships with minimal deps.
 */

import fs from "node:fs";
import path from "node:path";

const DEFAULT_API = "https://api.dashfordevs.com";

function parseEnvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

export function loadConfig() {
  const cwd = process.cwd();
  const fromEnv = parseEnvFile(path.join(cwd, ".env"));
  const fromLocal = parseEnvFile(path.join(cwd, ".env.local"));
  const merged = { ...fromEnv, ...fromLocal, ...process.env };

  const apiKey = merged.DASH4DEVS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "DASH4DEVS_API_KEY not set. Get one from your organization's API settings and add it to .env.local"
    );
  }
  if (!apiKey.startsWith("sk_")) {
    throw new Error("DASH4DEVS_API_KEY must be a secret key (starts with sk_). Public pk_ keys cannot deploy.");
  }

  return {
    apiKey,
    apiUrl: (merged.DASH4DEVS_API_URL || DEFAULT_API).replace(/\/$/, ""),
    cwd,
    buildDir: merged.DASH4DEVS_BUILD_DIR || ".next",
    publicDir: merged.DASH4DEVS_PUBLIC_DIR || "public",
  };
}
