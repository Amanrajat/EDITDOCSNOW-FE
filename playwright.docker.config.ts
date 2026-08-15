import { defineConfig, devices } from "@playwright/test";

/**
 * Separate config for the 3 Office -> PDF conversions (Word/Excel/
 * PowerPoint), which need a backend with LibreOffice actually installed -
 * that only exists in the production Docker image, not this host's dev
 * venv. Run manually: start the container as a real server first
 * (`docker run -d --network host ... editdocsnow-be:test`, PORT=8040),
 * then `npx playwright test --config=playwright.docker.config.ts`.
 * The main playwright.config.ts's webServer array manages the venv-based
 * backend for every other feature; this one only starts the frontend,
 * pointed at the already-running container.
 */
export default defineConfig({
  testDir: "./e2e-docker",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:3105",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev -- -p 3105",
    cwd: __dirname,
    env: { ...process.env, NEXT_PUBLIC_API_BASE: "http://localhost:8040/docs_editor" },
    url: "http://localhost:3105",
    reuseExistingServer: false,
    timeout: 60_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
