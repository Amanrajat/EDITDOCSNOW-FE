import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { inspectPdf } from "../e2e/utils/verify-pdf";

const FIXTURE_PPTX = path.join(__dirname, "..", "e2e", "fixtures", "sample.pptx");

test.describe("PowerPoint to PDF (real LibreOffice backend)", () => {
  test("converts a real .pptx to a real PDF via LibreOffice", async ({ page }) => {
    await page.goto("/powerpoint-to-pdf");
    await expect(page.getByRole("heading", { name: "PowerPoint to PDF", exact: true })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PPTX);

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/convert/pptx-to-pdf/") && res.request().method() === "POST"),
      page.getByRole("button", { name: "Convert to PDF" }).click(),
    ]);
    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Your presentation is now a PDF", exact: true })).toBeVisible({ timeout: 30_000 });

    const body = await response.json();
    expect(body.data.page_count).toBe(1);

    const fetched = await page.request.get(body.data.download_url);
    const outPath = path.join(__dirname, ".tmp-pptx-to-pdf.pdf");
    await fs.writeFile(outPath, await fetched.body());

    const facts = inspectPdf(outPath);
    expect(facts.page_count).toBe(1);
    expect(facts.texts[0]).toContain("Quarterly Results Overview");
  });
});
