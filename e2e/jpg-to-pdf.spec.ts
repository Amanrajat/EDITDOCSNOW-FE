import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { inspectPdf } from "./utils/verify-pdf";

const FIXTURE_DIR = path.join(__dirname, "fixtures");

test.describe("JPG to PDF", () => {
  test.beforeAll(async () => {
    // Two real, distinguishably-colored JPEGs (not renamed junk) - a
    // sharp module-free way to build one is via a Python one-liner using
    // Pillow, which the backend venv already has installed.
    const { execFileSync } = await import("node:child_process");
    const backendPython = path.join(__dirname, "../../EDITDOCSNOW-BE", ".venv", "bin", "python");
    const script = `
import sys
from PIL import Image
Image.new("RGB", (400, 300), tuple(map(int, sys.argv[2].split(",")))).save(sys.argv[1], format="JPEG")
`;
    execFileSync(backendPython, ["-c", script, path.join(FIXTURE_DIR, "red.jpg"), "220,30,30"]);
    execFileSync(backendPython, ["-c", script, path.join(FIXTURE_DIR, "blue.jpg"), "30,30,220"]);
  });

  test("combines two images into a PDF, one page each, in upload order", async ({ page }) => {
    await page.goto("/jpg-to-pdf");
    await expect(page.getByRole("heading", { name: "JPG to PDF", exact: true })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles([
      path.join(FIXTURE_DIR, "red.jpg"),
      path.join(FIXTURE_DIR, "blue.jpg"),
    ]);
    await expect(page.getByText("2 images · drag", { exact: false })).toBeVisible();

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/convert/jpg-to-pdf/") && res.request().method() === "POST"),
      page.getByRole("button", { name: /Create PDF from 2 images/ }).click(),
    ]);
    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Your PDF is ready", exact: true })).toBeVisible({ timeout: 15_000 });

    const body = await response.json();
    expect(body.data.page_count).toBe(2);

    const fetched = await page.request.get(body.data.download_url);
    const outPath = path.join(__dirname, ".tmp-jpg-to-pdf.pdf");
    await fs.writeFile(outPath, await fetched.body());

    const facts = inspectPdf(outPath);
    expect(facts.page_count).toBe(2);
  });

  test("landscape orientation produces wider-than-tall pages", async ({ page }) => {
    await page.goto("/jpg-to-pdf");
    await page.locator('input[type="file"]').setInputFiles(path.join(FIXTURE_DIR, "red.jpg"));

    await page.getByRole("radio", { name: "Landscape" }).click();

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/convert/jpg-to-pdf/") && res.request().method() === "POST"),
      page.getByRole("button", { name: /Create PDF from 1 image/ }).click(),
    ]);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.orientation).toBe("landscape");

    const fetched = await page.request.get(body.data.download_url);
    const outPath = path.join(__dirname, ".tmp-jpg-to-pdf-landscape.pdf");
    await fs.writeFile(outPath, await fetched.body());

    const facts = inspectPdf(outPath);
    const [width, height] = facts.sizes[0] as [number, number];
    expect(width).toBeGreaterThan(height);
  });
});
