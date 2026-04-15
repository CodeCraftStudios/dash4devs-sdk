#!/usr/bin/env node
/**
 * dash4devs CLI entry.
 *
 * Subcommands:
 *   dash4devs build           Build Next.js app and upload static assets to CDN
 *   dash4devs deploy          Alias for build + activate
 *   dash4devs status          Show current active deployment
 *   dash4devs purge <paths>   Invalidate edge cache for one or more paths
 *   dash4devs rollback <id>   Activate a previous deployment
 *
 * Auth:
 *   Reads DASH4DEVS_API_KEY from env (falls back to .env.local / .env).
 *   Must be a secret key (sk_live_* or sk_test_*).
 */

import { run as runBuild } from "./commands/build.js";
import { run as runStatus } from "./commands/status.js";
import { printBanner, printError } from "./ui.js";

const COMMANDS = {
  build: runBuild,
  deploy: runBuild, // alias, activates by default
  status: runStatus,
};

async function main() {
  const [, , cmd, ...rest] = process.argv;

  if (!cmd || cmd === "-h" || cmd === "--help") {
    printBanner();
    console.log(`
Usage: dash4devs <command> [options]

Commands:
  build                 Build Next.js and upload static assets
  deploy                Build + activate in one step
  status                Show active deployment for this org

Environment:
  DASH4DEVS_API_KEY     Secret key (sk_*) for your organization
  DASH4DEVS_API_URL     Override API URL (default: https://api.dashfordevs.com)
`);
    process.exit(0);
  }

  const handler = COMMANDS[cmd];
  if (!handler) {
    printError(`Unknown command: ${cmd}`);
    process.exit(1);
  }

  try {
    await handler(rest);
  } catch (err) {
    printError(err.message || String(err));
    if (process.env.DASH4DEVS_DEBUG) console.error(err);
    process.exit(1);
  }
}

main();
