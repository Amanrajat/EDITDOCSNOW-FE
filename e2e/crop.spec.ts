import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { inspectPdf } from "./utils/verify-pdf";

const FIXTURE_3PAGE = path.join(__dirname, "fixtures", "sample-3page.pdf");

test.describe("Crop PDF", () => {
  test("dragging the crop rectangle and applying it shrinks all pages", async ({ page }) => {
    await page.goto("/crop");
    await expect(page.getByRole("heading", { name: "Crop PDF", exact: true })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_3PAGE);

    const cropBox = page.locator("[data-crop-box]");
    await expect(cropBox).toBeVisible();

    // Drag the bottom-right corner handle inward to shrink the rect
    // noticeably below the default 90% x 90% starting size.
    const handle = page.locator('[data-crop-handle="se"]');
    const handleBox = await handle.boundingBox();
    if (!handleBox) throw new Error("crop handle not found");

    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox.x - 100, handleBox.y - 100, { steps: 10 });
    await page.mouse.up();

    await expect(page.getByText(/Crop rect: 5%, 5% → \d+%, \d+%/)).toBeVisible();

    const applyButton = page.getByRole("button", { name: "Apply crop" });
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/crop/") && res.request().method() === "POST"),
      applyButton.click(),
    ]);
    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "PDF cropped", exact: true })).toBeVisible({ timeout: 15_000 });

    const body = await response.json();
    expect(body.data.page_count).toBe(3);
    expect(body.data.cropped_pages).toEqual([1, 2, 3]);

    const fetched = await page.request.get(body.data.download_url);
    const outPath = path.join(__dirname, ".tmp-crop-drag.pdf");
    await fs.writeFile(outPath, await fetched.body());

    const facts = inspectPdf(outPath);
    expect(facts.page_count).toBe(3);
    // Original fixture pages are 595x842 (A4). The dragged rect should be
    // meaningfully smaller than the full page in both dimensions.
    for (const [width, height] of facts.sizes) {
      expect(width).toBeLessThan(595);
      expect(height).toBeLessThan(842);
      expect(width).toBeGreaterThan(50);
      expect(height).toBeGreaterThan(50);
    }
  });

  test("crops only the selected page, leaving others untouched", async ({ page }) => {
    await page.goto("/crop");
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_3PAGE);
    await expect(page.locator("[data-crop-box]")).toBeVisible();

    await page.getByRole("button", { name: "10% margin" }).click();
    await expect(page.getByText("Crop rect: 10%, 10% → 90%, 90%")).toBeVisible();

    // Select only page 2 to crop.
    await page.getByRole("button", { name: "Select page 2" }).click();
    await expect(page.getByText("Apply to 1 selected page")).toBeVisible();

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/crop/") && res.request().method() === "POST"),
      page.getByRole("button", { name: "Apply crop" }).click(),
    ]);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.cropped_pages).toEqual([2]);

    const fetched = await page.request.get(body.data.download_url);
    const outPath = path.join(__dirname, ".tmp-crop-selected.pdf");
    await fs.writeFile(outPath, await fetched.body());

    const facts = inspectPdf(outPath);
    expect(facts.page_count).toBe(3);
    // Page 1 and 3 (untouched) stay at the original A4 size.
    expect(facts.sizes[0]).toEqual([595, 842]);
    expect(facts.sizes[2]).toEqual([595, 842]);
    // Page 2 (cropped to a 10% inset on each side) is smaller.
    const page2Size = facts.sizes[1];
    if (!page2Size) throw new Error("expected a size entry for page 2");
    expect(page2Size[0]).toBeCloseTo(595 * 0.8, 0);
    expect(page2Size[1]).toBeCloseTo(842 * 0.8, 0);
    expect(facts.texts[1]).toContain("PAGE TWO");
  });

  test("reset crop returns the rectangle to the full page", async ({ page }) => {
    await page.goto("/crop");
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_3PAGE);
    await expect(page.locator("[data-crop-box]")).toBeVisible();

    await page.getByRole("button", { name: "20% margin" }).click();
    await expect(page.getByText("Crop rect: 20%, 20% → 80%, 80%")).toBeVisible();

    await page.getByRole("button", { name: "Reset crop" }).click();
    await expect(page.getByText("Crop rect: 0%, 0% → 100%, 100%")).toBeVisible();
  });
});
