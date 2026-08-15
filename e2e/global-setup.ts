import { spawn, execSync } from "node:child_process";
import net from "node:net";
import path from "node:path";
import fs from "node:fs";

const BACKEND_ROOT = path.resolve(__dirname, "../../EDITDOCSNOW-BE");
const BACKEND_PYTHON = path.join(BACKEND_ROOT, ".venv", "bin", "python");
const CELERY_BIN = path.join(BACKEND_ROOT, ".venv", "bin", "celery");
const PID_FILE = path.join(__dirname, ".celery-worker.pid");

function isPortOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ port, host: "127.0.0.1" });
    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false);
    });
  });
}

async function ensureRedis() {
  if (await isPortOpen(6379)) return;

  try {
    execSync("docker start editdocsnow-redis", { stdio: "ignore" });
  } catch {
    execSync("docker run -d --name editdocsnow-redis -p 6379:6379 redis:7-alpine", { stdio: "ignore" });
  }

  for (let i = 0; i < 20; i++) {
    if (await isPortOpen(6379)) return;
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Redis did not become reachable on 6379 for Batch Processing E2E tests");
}

export default async function globalSetup() {
  // Batch Processing runs on Celery, not the synchronous request cycle -
  // its E2E test needs a real worker actually consuming tasks, same as
  // production. Redis is a plain local dev dependency here, same as the
  // local Postgres this backend already relies on for its test suite.
  await ensureRedis();

  const worker = spawn(
    CELERY_BIN,
    ["-A", "core", "worker", "--loglevel=info", "--concurrency=2"],
    {
      cwd: BACKEND_ROOT,
      env: { ...process.env, DATABASE_URL: "" },
      detached: true,
      stdio: "ignore",
    },
  );
  worker.unref();
  fs.writeFileSync(PID_FILE, String(worker.pid));

  // Give the worker a moment to connect to the broker before tests start
  // submitting tasks.
  await new Promise((r) => setTimeout(r, 2500));
}
