import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const targets = [".next", "node_modules/.cache", ".dev-server.log"];

for (const target of targets) {
  await rm(join(root, target), { recursive: true, force: true });
  console.log(`removed ${target}`);
}

console.log("\nCache cleared. Run `npm run dev` to start fresh.");
