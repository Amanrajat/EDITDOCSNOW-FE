import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { inspectPdf } from "../e2e/utils/verify-pdf";

const FIXTURE_SCANNED = path.join(__dirname, "..", "e2e", "fixtures", "scanned.pdf");

test.describe("OCR (real Tesseract backend + Celery worker)", () => {
  test("makes a scanned PDF searchable via real OCR", async ({ page }) => {
    await page.goto("/ocr");
    await expect(page.getByRole("heading", { name: /OCR/ })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_SCANNED);
    await page.getByRole("button", { name: "Run OCR" }).click();

    // Async: the job goes through queued/processing before completing -
    // give it real time for Tesseract to actually run.
    await expect(page.getByRole("heading", { name: "Your PDF is now searchable" })).toBeVisible({ timeout: 60_000 });
    await expect(page.getByText(/1 of 1 page.* recognized via OCR/)).toBeVisible();

    const downloadButton = page.getByRole("button", { name: "Download" });
    await expect(downloadButton).toBeVisible();

    // Fetch the real output directly to verify with PyMuPDF - the
    // downloaded PDF must now contain genuinely recognized, searchable text.
    const downloadPromise = page.waitForEvent("download").catch(() => null);
    await downloadButton.click();
    const download = await downloadPromise;

    let outPath: string;
    if (download) {
      outPath = path.join(__dirname, ".tmp-ocr-output.pdf");
      await download.saveAs(outPath);
    } else {
      // Fallback: re-request the same href directly if the browser
      // handled the download without emitting a Playwright download event.
      const href = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll("a"));
        const match = anchors.find((a) => a.href.includes("/ocr/") && a.href.includes("/download/"));
        return match?.href ?? null;
      });
      expect(href).not.toBeNull();
      const fetched = await page.request.get(href as string);
      outPath = path.join(__dirname, ".tmp-ocr-output.pdf");
      await fs.writeFile(outPath, await fetched.body());
    }

    const facts = inspectPdf(outPath);
    expect(facts.page_count).toBe(1);
    expect((facts.texts[0] ?? "").toUpperCase().replace(/\s+/g, "")).toContain("SEARCHABLE");
  });
});
