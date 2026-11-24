import "dotenv/config";
import { createApp } from "./app.js";
import { prisma } from "./database/prisma.js";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const port = Number(process.env.PORT) || 5000;
const server = createApp().listen(port, () => console.log(`API listening on port ${port}`));

async function shutdown(signal) {
  console.log(`${signal} received; shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
