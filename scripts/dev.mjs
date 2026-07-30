import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function run(name, cwd) {
  const child = spawn("npm", ["run", "dev"], {
    cwd: resolve(root, cwd),
    shell: true,
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      console.log(`\n[${name}] stopped (${signal})`);
      return;
    }
    if (code && code !== 0) {
      console.error(`\n[${name}] exited with code ${code}`);
      process.exitCode = code;
    }
  });

  return child;
}

const backend = run("backend", "backend");
const frontend = run("frontend", "frontend");

function shutdown() {
  backend.kill();
  frontend.kill();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
