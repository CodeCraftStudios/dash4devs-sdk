import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";

// ASCII art lives in a plain .txt so backticks/backslashes render verbatim.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ART = fs.readFileSync(path.join(__dirname, "banner.txt"), "utf8");

export function printInitBanner() {
  console.log(chalk.cyan(ART));
  console.log(
    chalk.dim("  Scaffold a headless storefront powered by ") +
      chalk.bold.cyan("DashForDevs") +
      chalk.dim(" — www.dashfordevs.com\n")
  );
}
