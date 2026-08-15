import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { inspectXlsx } from "./utils/verify-office";

const FIXTURE_WITH_TABLE = path.join(__dirname, "fixtures", "sample-with-table.pdf");

test.describe("PDF to Excel", () => {
  test("extracts a real table into an xlsx sheet", async ({ page }) => {
    await page.goto("/pdf-to-excel");
    await expect(page.getByRole("heading", { name: "PDF to Excel" })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_WITH_TABLE);

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/convert/pdf-to-excel/") && res.request().method() === "POST"),
      page.getByRole("button", { name: "Convert to Excel" }).click(),
    ]);
    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Your PDF is now an Excel workbook" })).toBeVisible({ timeout: 15_000 });

    const body = await response.json();
    expect(body.data.table_count).toBe(1);

    const fetched = await page.request.get(body.data.download_url);
    const outPath = path.join(__dirname, ".tmp-pdf-to-excel.xlsx");
    await fs.writeFile(outPath, await fetched.body());

    const facts = inspectXlsx(outPath);
    expect(facts.sheet_names).toEqual(["Page 1"]);
    expect(facts.first_sheet_rows[0]).toEqual(["Name", "Score"]);
    expect(facts.first_sheet_rows[1]).toEqual(["Alice", "92"]);
  });
});
