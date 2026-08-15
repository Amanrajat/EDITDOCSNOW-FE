import path from "node:path";
import { test, expect } from "@playwright/test";

const FIXTURE_WITH_TABLE = path.join(__dirname, "fixtures", "sample-with-table.pdf");

test.describe("PDF to Markdown", () => {
  test("extracts a heading, paragraph, and table into real markdown", async ({ page }) => {
    await page.goto("/pdf-to-markdown");
    await expect(page.getByRole("heading", { name: "PDF to Markdown", exact: true })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_WITH_TABLE);

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/convert/pdf-to-markdown/") && res.request().method() === "POST"),
      page.getByRole("button", { name: "Convert to Markdown" }).click(),
    ]);
    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Your PDF is now Markdown", exact: true })).toBeVisible({ timeout: 15_000 });

    const body = await response.json();
    expect(body.data.heading_count).toBeGreaterThanOrEqual(1);
    expect(body.data.table_count).toBe(1);

    const fetched = await page.request.get(body.data.download_url);
    expect(fetched.headers()["content-type"]).toContain("text/markdown");
    const markdown = (await fetched.body()).toString("utf-8");

    expect(markdown).toContain("# Report Heading");
    expect(markdown).toContain("This is a body paragraph with real sentence content.");
    expect(markdown).toContain("| Name | Score |");
    expect(markdown).toContain("| Alice | 92 |");
  });
});
