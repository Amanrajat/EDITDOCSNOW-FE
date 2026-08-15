import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { inspectPdf } from "./utils/verify-pdf";

const FIXTURE_IMAGE_HEAVY = path.join(__dirname, "fixtures", "sample-image-heavy.pdf");

test.describe("Compress PDF", () => {
  test("compresses an image-heavy PDF and shows real before/after stats", async ({ page }) => {
    await page.goto("/compress");
    await expect(page.getByRole("heading", { name: "Compress PDF" })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_IMAGE_HEAVY);
    // SelectableCard's real checkbox input is visually hidden (the card
    // body is the clickable surface), so click the visible label text.
    await page.getByText("Maximum Compression", { exact: true }).click();
    await expect(page.getByRole("checkbox", { name: "Maximum Compression" })).toBeChecked();

    const submitButton = page.getByRole("button", { name: "Compress PDF" });
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/compress/") && res.request().method() === "POST"),
      submitButton.click(),
    ]);
    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Your PDF is compressed" })).toBeVisible({ timeout: 30_000 });

    const body = await response.json();
    const data = body.data;
    expect(data.level).toBe("maximum_compression");
    expect(data.page_count).toBe(2);
    expect(data.original_size).toBeGreaterThan(0);
    // A real photo-heavy PDF at maximum compression should shrink a lot -
    // not just marginally, and never claim a reduction that didn't happen.
    expect(data.compressed_size).toBeLessThan(data.original_size * 0.5);
    expect(data.saved_size).toBe(data.original_size - data.compressed_size);
    expect(data.reduction_percent).toBeGreaterThan(50);

    // UI shows the same numbers, not placeholder text.
    await expect(page.getByText(`${data.reduction_percent}%`).first()).toBeVisible();

    const fetched = await page.request.get(data.download_url);
    const outPath = path.join(__dirname, ".tmp-compress.pdf");
    const buffer = await fetched.body();
    await fs.writeFile(outPath, buffer);

    expect(buffer.length).toBe(data.compressed_size);
    const facts = inspectPdf(outPath);
    expect(facts.page_count).toBe(2);
    expect(facts.texts[0]).toContain("PHOTO PAGE 1");
    expect(facts.texts[1]).toContain("PHOTO PAGE 2");
  });

  test("defaults to the Recommended level", async ({ page }) => {
    await page.goto("/compress");
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_IMAGE_HEAVY);

    const recommendedCheckbox = page.getByRole("checkbox", { name: "Recommended" });
    await expect(recommendedCheckbox).toBeChecked();
  });
});
