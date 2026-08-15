import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { inspectPdf } from "./utils/verify-pdf";

const FIXTURE_3PAGE = path.join(__dirname, "fixtures", "sample-3page.pdf");

test.describe("Split PDF (regression)", () => {
  test("extracts specific pages in the requested order", async ({ page }) => {
    await page.goto("/split");
    await expect(page.getByRole("heading", { name: "Split PDF" })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_3PAGE);
    await page.getByRole("radio", { name: "Extract pages" }).click();
    await page.getByLabel("Pages to extract").fill("3,1");

    const splitButton = page.getByRole("button", { name: "Split PDF" });
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/split/") && res.request().method() === "POST"),
      splitButton.click(),
    ]);
    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Your PDF is split" })).toBeVisible({ timeout: 15_000 });

    const body = await response.json();
    expect(body.data.is_zip).toBe(false);
    const fetched = await page.request.get(body.data.download_url);
    const outPath = path.join(__dirname, ".tmp-split-extract.pdf");
    await fs.writeFile(outPath, await fetched.body());

    const facts = inspectPdf(outPath);
    expect(facts.page_count).toBe(2);
    // Order requested was "3,1" - output must preserve that order, not sort it.
    expect(facts.texts[0]).toContain("PAGE THREE");
    expect(facts.texts[1]).toContain("PAGE ONE");
  });

  test("all-pages mode zips one file per page", async ({ page }) => {
    await page.goto("/split");
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_3PAGE);

    const splitButton = page.getByRole("button", { name: "Split PDF" });
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/split/") && res.request().method() === "POST"),
      splitButton.click(),
    ]);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.is_zip).toBe(true);
    expect(body.data.output_count).toBe(3);
    await expect(page.getByRole("heading", { name: "Your PDF is split" })).toBeVisible({ timeout: 15_000 });
  });
});
