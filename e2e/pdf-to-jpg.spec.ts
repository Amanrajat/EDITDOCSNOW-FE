import path from "node:path";
import { test, expect } from "@playwright/test";

const FIXTURE_3PAGE = path.join(__dirname, "fixtures", "sample-3page.pdf");

test.describe("PDF to JPG", () => {
  test("converts a single selected page to a real JPG", async ({ page }) => {
    await page.goto("/pdf-to-jpg");
    await expect(page.getByRole("heading", { name: "PDF to JPG" })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_3PAGE);
    await expect(page.locator("[data-thumbnail-page]")).toHaveCount(3);

    await page.getByRole("button", { name: "Select page 2" }).click();

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/convert/pdf-to-jpg/") && res.request().method() === "POST"),
      page.getByRole("button", { name: "Convert to JPG" }).click(),
    ]);
    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Your image is ready" })).toBeVisible({ timeout: 15_000 });

    const body = await response.json();
    expect(body.data.converted_pages).toEqual([2]);

    const fetched = await page.request.get(body.data.download_url);
    expect(fetched.headers()["content-type"]).toBe("image/jpeg");
    const buffer = await fetched.body();
    expect(buffer.subarray(0, 2).toString("hex")).toBe("ffd8"); // real JPEG magic bytes
  });

  test("converts all pages and zips the result", async ({ page }) => {
    await page.goto("/pdf-to-jpg");
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_3PAGE);
    await expect(page.locator("[data-thumbnail-page]")).toHaveCount(3);

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/convert/pdf-to-jpg/") && res.request().method() === "POST"),
      page.getByRole("button", { name: "Convert to JPG" }).click(),
    ]);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.converted_pages).toEqual([1, 2, 3]);

    await expect(page.getByRole("heading", { name: "Your images are ready" })).toBeVisible({ timeout: 15_000 });

    const fetched = await page.request.get(body.data.download_url);
    expect(fetched.headers()["content-type"]).toBe("application/zip");
  });
});
