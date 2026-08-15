import path from "node:path";
import fs from "node:fs";

const PID_FILE = path.join(__dirname, ".celery-worker.pid");

export default async function globalTeardown() {
  if (!fs.existsSync(PID_FILE)) return;
  const pid = Number(fs.readFileSync(PID_FILE, "utf-8"));
  fs.unlinkSync(PID_FILE);

  try {
    // Negative pid = kill the whole detached process group (worker +
    // its forked pool processes), not just the parent.
    process.kill(-pid, "SIGTERM");
  } catch {
    // Already gone - nothing to do.
  }
}
