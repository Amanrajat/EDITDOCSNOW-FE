import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { inspectPptx } from "./utils/verify-office";

const FIXTURE_WITH_TABLE = path.join(__dirname, "fixtures", "sample-with-table.pdf");

test.describe("PDF to PowerPoint", () => {
  test("creates one slide with real text and a real table", async ({ page }) => {
    await page.goto("/pdf-to-powerpoint");
    await expect(page.getByRole("heading", { name: "PDF to PowerPoint", exact: true })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_WITH_TABLE);

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/convert/pdf-to-pptx/") && res.request().method() === "POST"),
      page.getByRole("button", { name: "Convert to PowerPoint" }).click(),
    ]);
    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Your PDF is now a slide deck", exact: true })).toBeVisible({ timeout: 15_000 });

    const fetched = await page.request.get((await response.json()).data.download_url);
    const outPath = path.join(__dirname, ".tmp-pdf-to-pptx.pptx");
    await fs.writeFile(outPath, await fetched.body());

    const facts = inspectPptx(outPath);
    expect(facts.slide_count).toBe(1);
    expect(facts.slide_texts[0]).toContain("Report Heading");
  });
});
