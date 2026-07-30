import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`\n  DriveFlow API v1`);
  console.log(`  http://localhost:${env.PORT}`);
  console.log(`  Health  http://localhost:${env.PORT}/api/v1/health\n`);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
