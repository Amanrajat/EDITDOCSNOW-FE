import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { inspectPdf } from "./utils/verify-pdf";

const FIXTURE_3PAGE = path.join(__dirname, "fixtures", "sample-3page.pdf");
const FIXTURE_1PAGE = path.join(__dirname, "fixtures", "sample-1page.pdf");

test.describe("Merge PDF (regression)", () => {
  test("merges two PDFs and verifies real combined output", async ({ page }) => {
    await page.goto("/merge");
    await expect(page.getByRole("heading", { name: "Merge PDF" })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles([FIXTURE_3PAGE, FIXTURE_1PAGE]);
    await expect(page.getByText("2 files")).toBeVisible();

    const mergeButton = page.getByRole("button", { name: /Merge 2 PDFs/ });
    await expect(mergeButton).toBeEnabled();

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/merge/") && res.request().method() === "POST"),
      mergeButton.click(),
    ]);
    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Your PDFs are merged" })).toBeVisible({ timeout: 15_000 });

    const body = await response.json();
    const fetched = await page.request.get(body.data.download_url);
    expect(fetched.ok()).toBeTruthy();
    const outPath = path.join(__dirname, ".tmp-merge.pdf");
    await fs.writeFile(outPath, await fetched.body());

    const facts = inspectPdf(outPath);
    expect(facts.page_count).toBe(4);
    expect(facts.texts[0]).toContain("PAGE ONE");
    expect(facts.texts[3]).toContain("ONLY PAGE");
  });
});
