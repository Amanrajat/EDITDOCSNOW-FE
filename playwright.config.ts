import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const BACKEND_ROOT = path.resolve(__dirname, "../EDITDOCSNOW-BE");
const BACKEND_PYTHON = path.join(BACKEND_ROOT, ".venv", "bin", "python");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  timeout: 30_000,
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: `${BACKEND_PYTHON} manage.py runserver 0.0.0.0:8010 --noreload`,
      cwd: BACKEND_ROOT,
      env: { ...process.env, DATABASE_URL: "" },
      url: "http://localhost:8010/admin/login/",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      command: "npm run dev -- -p 3100",
      cwd: __dirname,
      env: { ...process.env, NEXT_PUBLIC_API_BASE: "http://localhost:8010/docs_editor" },
      url: "http://localhost:3100",
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
      stdout: "pipe",
      stderr: "pipe",
    },
  ],
});
