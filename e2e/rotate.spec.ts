import path from "node:path";
import { test, expect } from "@playwright/test";
import { inspectPdf } from "./utils/verify-pdf";

const FIXTURE_3PAGE = path.join(__dirname, "fixtures", "sample-3page.pdf");

test.describe("Rotate PDF", () => {
  test("rotates a single selected page 90° and verifies real output rotation", async ({ page }) => {
    await page.goto("/rotate");
    await expect(page.getByRole("heading", { name: "Rotate PDF", exact: true })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_3PAGE);

    const thumbnails = page.locator("[data-thumbnail-page]");
    await expect(thumbnails).toHaveCount(3);

    // Select page 2 only, then rotate right 90 - should affect only page 2.
    await page.getByRole("button", { name: "Select page 2" }).click();
    await page.getByRole("button", { name: "Rotate right 90°" }).click();

    await expect(page.locator('[data-thumbnail-page="2"]')).toContainText("90°");
    await expect(page.locator('[data-thumbnail-page="1"]')).not.toContainText("°");
    await expect(page.locator('[data-thumbnail-page="3"]')).not.toContainText("°");

    const applyButton = page.getByRole("button", { name: /Apply rotation/ });
    await expect(applyButton).toBeEnabled();

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/rotate/") && res.request().method() === "POST"),
      applyButton.click(),
    ]);
    expect(response.ok()).toBeTruthy();

    await expect(page.getByRole("heading", { name: "PDF rotated", exact: true })).toBeVisible({ timeout: 15_000 });

    const body = await response.json();
    const downloadUrl: string = body.data.download_url;
    const fetched = await page.request.get(downloadUrl);
    expect(fetched.ok()).toBeTruthy();
    const buffer = await fetched.body();

    const outPath = path.join(__dirname, ".tmp-rotate-single.pdf");
    await import("node:fs/promises").then((fs) => fs.writeFile(outPath, buffer));

    const facts = inspectPdf(outPath);
    expect(facts.page_count).toBe(3);
    expect(facts.rotations).toEqual([0, 90, 0]);
    // Text content must survive rotation untouched.
    expect(facts.texts[0]).toContain("PAGE ONE");
    expect(facts.texts[1]).toContain("PAGE TWO");
    expect(facts.texts[2]).toContain("PAGE THREE");
  });

  test("rotates all pages 180° when none are selected", async ({ page }) => {
    await page.goto("/rotate");
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_3PAGE);
    await expect(page.locator("[data-thumbnail-page]")).toHaveCount(3);

    await expect(page.getByText("No pages selected")).toBeVisible();
    await page.getByRole("button", { name: "Rotate 180°" }).click();

    for (const pageNumber of [1, 2, 3]) {
      await expect(page.locator(`[data-thumbnail-page="${pageNumber}"]`)).toContainText("180°");
    }

    const applyButton = page.getByRole("button", { name: /Apply rotation/ });
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/rotate/") && res.request().method() === "POST"),
      applyButton.click(),
    ]);
    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "PDF rotated", exact: true })).toBeVisible({ timeout: 15_000 });

    const body = await response.json();
    const fetched = await page.request.get(body.data.download_url);
    const buffer = await fetched.body();
    const outPath = path.join(__dirname, ".tmp-rotate-all.pdf");
    await import("node:fs/promises").then((fs) => fs.writeFile(outPath, buffer));

    const facts = inspectPdf(outPath);
    expect(facts.rotations).toEqual([180, 180, 180]);
  });

  test("apply button stays disabled until a rotation is pending", async ({ page }) => {
    await page.goto("/rotate");
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_3PAGE);
    await expect(page.locator("[data-thumbnail-page]")).toHaveCount(3);

    await expect(page.getByRole("button", { name: /Apply rotation/ })).toBeDisabled();
  });
});
