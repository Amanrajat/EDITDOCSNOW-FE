import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { inspectDocx } from "./utils/verify-office";

const FIXTURE_WITH_TABLE = path.join(__dirname, "fixtures", "sample-with-table.pdf");

test.describe("PDF to Word", () => {
  test("converts to a real docx with text and a table", async ({ page }) => {
    await page.goto("/pdf-to-word");
    await expect(page.getByRole("heading", { name: "PDF to Word", exact: true })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_WITH_TABLE);

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/convert/pdf-to-word/") && res.request().method() === "POST"),
      page.getByRole("button", { name: "Convert to Word" }).click(),
    ]);
    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Your PDF is now a Word document", exact: true })).toBeVisible({ timeout: 15_000 });

    const body = await response.json();
    expect(body.data.table_count).toBe(1);

    const fetched = await page.request.get(body.data.download_url);
    expect(fetched.ok()).toBeTruthy();
    const outPath = path.join(__dirname, ".tmp-pdf-to-word.docx");
    await fs.writeFile(outPath, await fetched.body());

    const facts = inspectDocx(outPath);
    expect(facts.paragraphs).toContain("Report Heading");
    expect(facts.paragraphs).toContain("This is a body paragraph with real sentence content.");
    expect(facts.table_count).toBe(1);
  });
});
