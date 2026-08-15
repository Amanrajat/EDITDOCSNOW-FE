import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { inspectPdf } from "./utils/verify-pdf";

const FIXTURE_3PAGE = path.join(__dirname, "fixtures", "sample-3page.pdf");

test.describe("Remove Pages (regression)", () => {
  test("removes a marked page and preserves order of the rest", async ({ page }) => {
    await page.goto("/remove-pages");
    await expect(page.getByRole("heading", { name: "Remove Pages" })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_3PAGE);
    await expect(page.locator("[data-thumbnail-page]")).toHaveCount(3);

    await page.getByRole("button", { name: "Mark for removal: page 2" }).click();

    const removeButton = page.getByRole("button", { name: "Remove 1 page" });
    await removeButton.click();

    await page.getByRole("button", { name: "Remove pages", exact: true }).click();

    await expect(page.getByRole("heading", { name: "Pages removed" })).toBeVisible({ timeout: 15_000 });
  });

  test("real output: removed page is gone, remaining pages keep their order", async ({ page }) => {
    await page.goto("/remove-pages");
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_3PAGE);
    await expect(page.locator("[data-thumbnail-page]")).toHaveCount(3);

    await page.getByRole("button", { name: "Mark for removal: page 2" }).click();
    await page.getByRole("button", { name: "Remove 1 page" }).click();

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/v1/pdf/remove-pages/") && res.request().method() === "POST",
      ),
      page.getByRole("button", { name: "Remove pages", exact: true }).click(),
    ]);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    const fetched = await page.request.get(body.data.download_url);
    const outPath = path.join(__dirname, ".tmp-remove-pages.pdf");
    await fs.writeFile(outPath, await fetched.body());

    const facts = inspectPdf(outPath);
    expect(facts.page_count).toBe(2);
    expect(facts.texts[0]).toContain("PAGE ONE");
    expect(facts.texts[1]).toContain("PAGE THREE");
  });
});
