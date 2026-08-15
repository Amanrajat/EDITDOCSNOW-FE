import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { inspectPdf } from "./utils/verify-pdf";

const FIXTURE_3PAGE = path.join(__dirname, "fixtures", "sample-3page.pdf");

test.describe("Organize PDF (regression)", () => {
  test("drag-reorders pages and produces a PDF in the new order", async ({ page }) => {
    await page.goto("/organize");
    await expect(page.getByRole("heading", { name: "Organize PDF", exact: true })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_3PAGE);
    await expect(page.locator("[data-thumbnail-page]")).toHaveCount(3);

    // Drag page 1 (index 0) to the last slot (index 2): 1,2,3 -> 2,3,1.
    // Handlers only read component state (not dataTransfer), so a minimal
    // dragstart/dragover/drop dispatch is sufficient to exercise the real
    // reorder logic without flaky pointer-based DnD simulation.
    const first = page.locator('[data-thumbnail-position="1"]');
    const last = page.locator('[data-thumbnail-position="3"]');
    await first.dispatchEvent("dragstart");
    await last.dispatchEvent("dragover");
    await last.dispatchEvent("drop");

    await expect(page.locator('[data-thumbnail-position="1"]')).toHaveAttribute("data-thumbnail-page", "2");
    await expect(page.locator('[data-thumbnail-position="2"]')).toHaveAttribute("data-thumbnail-page", "3");
    await expect(page.locator('[data-thumbnail-position="3"]')).toHaveAttribute("data-thumbnail-page", "1");

    const organizeButton = page.getByRole("button", { name: "Organize PDF" });
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/organize/") && res.request().method() === "POST"),
      organizeButton.click(),
    ]);
    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Your PDF is organized", exact: true })).toBeVisible({ timeout: 15_000 });

    const body = await response.json();
    const fetched = await page.request.get(body.data.download_url);
    const outPath = path.join(__dirname, ".tmp-organize.pdf");
    await fs.writeFile(outPath, await fetched.body());

    const facts = inspectPdf(outPath);
    expect(facts.page_count).toBe(3);
    expect(facts.texts[0]).toContain("PAGE TWO");
    expect(facts.texts[1]).toContain("PAGE THREE");
    expect(facts.texts[2]).toContain("PAGE ONE");
  });
});
