import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { inspectPdf } from "../e2e/utils/verify-pdf";

const FIXTURE_XLSX = path.join(__dirname, "..", "e2e", "fixtures", "sample.xlsx");

test.describe("Excel to PDF (real LibreOffice backend)", () => {
  test("converts a real .xlsx to a real PDF via LibreOffice", async ({ page }) => {
    await page.goto("/excel-to-pdf");
    await expect(page.getByRole("heading", { name: "Excel to PDF" })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_XLSX);

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/convert/excel-to-pdf/") && res.request().method() === "POST"),
      page.getByRole("button", { name: "Convert to PDF" }).click(),
    ]);
    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Your Excel workbook is now a PDF" })).toBeVisible({ timeout: 30_000 });

    const body = await response.json();
    const fetched = await page.request.get(body.data.download_url);
    const outPath = path.join(__dirname, ".tmp-excel-to-pdf.pdf");
    await fs.writeFile(outPath, await fetched.body());

    const facts = inspectPdf(outPath);
    expect(facts.page_count).toBeGreaterThanOrEqual(1);
    const allText = facts.texts.join("\n");
    expect(allText).toContain("Alice");
    expect(allText).toContain("92");
  });
});
