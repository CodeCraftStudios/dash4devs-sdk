/**
 * `dash4devs build` — build Next.js app, upload changed static files, activate.
 *
 * Flow:
 *   1. Shell out to `next build` (or npm run build if a package script wins).
 *   2. Scan .next/static + public/ → manifest.
 *   3. POST /v1/cdn/manifest → deploy_id + signed URLs for new files only.
 *   4. PUT each signed URL in parallel (uploader.js).
 *   5. POST /v1/cdn/activate → atomic flip.
 *   6. Print summary box and write .env.local's NEXT_PUBLIC_ASSET_PREFIX.
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { loadConfig } from "../config.js";
import { createApi } from "../api.js";
import { scanBuild } from "../scanner.js";
import { uploadAll } from "../uploader.js";
import {
  printBanner,
  step,
  success,
  warn,
  printSummary,
  formatBytes,
} from "../ui.js";
import chalk from "chalk";
import ora from "ora";

const PKG_VERSION = "0.1.0";

export async function run(args) {
  const skipBuild = args.includes("--skip-build");
  const dryRun = args.includes("--dry-run");
  const noActivate = args.includes("--no-activate");

  printBanner();

  const cfg = loadConfig();
  const api = createApi(cfg);

  step("Auth", `key ${chalk.dim("····" + cfg.apiKey.slice(-4))} · ${cfg.apiUrl}`);

  if (!skipBuild) {
    step("Building Next.js app");
    await runNextBuild(cfg.cwd);
    success(`Built ${path.join(cfg.cwd, cfg.buildDir)}`);
  } else {
    warn("Skipping build (--skip-build)");
  }

  step("Hashing static files");
  const entries = await scanBuild(cfg);
  const totalBytes = entries.reduce((n, e) => n + e.size, 0);
  success(`${entries.length} files · ${formatBytes(totalBytes)}`);

  step("Diffing against CDN");
  const spinner = ora({ text: "uploading manifest…", indent: 4 }).start();
  const manifestRes = await api.manifest({
    sdk_version: PKG_VERSION,
    next_version: readNextVersion(cfg.cwd),
    files: entries.map((e) => ({
      path: e.path,
      sha256: e.sha256,
      size: e.size,
      content_type: e.content_type,
    })),
  });
  spinner.stop();

  const { deploy_id, needs_upload, stats } = manifestRes;
  const unchanged = stats.total_files - stats.new_files;
  success(
    `${stats.new_files} new · ${unchanged} cached · ${formatBytes(stats.new_bytes)} to upload`
  );

  if (dryRun) {
    warn("Dry run — skipping upload + activation");
    return;
  }

  if (needs_upload.length === 0) {
    success("Nothing to upload — all assets already on CDN");
  } else {
    step(`Uploading to edge (${needs_upload.length} files)`);
    const { failures } = await uploadAll({ api, entries, needsUpload: needs_upload });
    if (failures.length) {
      throw new Error(`${failures.length} uploads failed. First: ${failures[0].error}`);
    }
    success("All files uploaded");
  }

  if (noActivate) {
    warn(`Deploy ${deploy_id} uploaded but not activated (--no-activate)`);
    return;
  }

  step(`Activating ${deploy_id}`);
  const activated = await api.activate(deploy_id);
  success(`Live at ${activated.asset_prefix}`);

  // Persist asset prefix so next.config.mjs can pick it up via env.
  writeAssetPrefix(cfg.cwd, activated.asset_prefix);

  const savedBytes = stats.total_bytes - stats.new_bytes;
  printSummary([
    chalk.bold.green("Deploy successful"),
    "",
    `${chalk.dim("deploy")}  ${activated.deploy_id}`,
    `${chalk.dim("prefix")} ${activated.asset_prefix}`,
    `${chalk.dim("saved")}  ${formatBytes(savedBytes)} via dedup`,
  ]);
}

function runNextBuild(cwd) {
  return new Promise((resolve, reject) => {
    const cmd = process.platform === "win32" ? "npx.cmd" : "npx";
    const child = spawn(cmd, ["next", "build"], {
      cwd,
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`next build exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

function readNextVersion(cwd) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf8"));
    return (pkg.dependencies && pkg.dependencies.next) || (pkg.devDependencies && pkg.devDependencies.next) || "";
  } catch {
    return "";
  }
}

function writeAssetPrefix(cwd, prefix) {
  const envPath = path.join(cwd, ".env.local");
  let lines = [];
  if (fs.existsSync(envPath)) {
    lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/).filter(
      (l) => !l.startsWith("NEXT_PUBLIC_ASSET_PREFIX=")
    );
  }
  lines.push(`NEXT_PUBLIC_ASSET_PREFIX=${prefix}`);
  fs.writeFileSync(envPath, lines.join("\n"));
}
