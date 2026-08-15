import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { inspectPdf } from "./utils/verify-pdf";

const FIXTURE_PDF = path.join(__dirname, "fixtures", "sample-1page.pdf");

test.describe("Advanced PDF editor - text blocks (regression)", () => {
  test("editing a text block, undo/redo, and save still works after the object-editing extension", async ({
    page,
  }) => {
    await page.goto("/upload");
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_PDF);
    await page.waitForURL(/\/editor\/.+/, { timeout: 15_000 });

    const blockTextarea = page.locator('textarea[aria-label*="Editable text block"]').first();
    await expect(blockTextarea).toBeVisible({ timeout: 15_000 });
    await expect(blockTextarea).toHaveValue("ONLY PAGE");

    await blockTextarea.fill("EDITED PAGE HEADING");
    await expect(blockTextarea).toHaveValue("EDITED PAGE HEADING");

    await page.keyboard.press("Control+z");
    await expect(blockTextarea).toHaveValue("ONLY PAGE");
    await page.keyboard.press("Control+Shift+z");
    await expect(blockTextarea).toHaveValue("EDITED PAGE HEADING");

    const [saveResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/save/") && res.request().method() === "POST"),
      page.getByRole("button", { name: "Save" }).click(),
    ]);
    expect(saveResponse.ok()).toBeTruthy();
    const body = await saveResponse.json();

    const fetched = await page.request.get(body.download_url);
    expect(fetched.ok()).toBeTruthy();
    const outPath = path.join(__dirname, ".tmp-docs-editor-blocks-regression.pdf");
    await fs.writeFile(outPath, await fetched.body());

    const facts = inspectPdf(outPath);
    expect(facts.page_count).toBe(1);
    expect(facts.texts[0]).toContain("EDITED PAGE HEADING");
  });
});
