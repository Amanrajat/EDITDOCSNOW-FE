import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { inspectPdf } from "./utils/verify-pdf";

const FIXTURE_3PAGE = path.join(__dirname, "fixtures", "sample-3page.pdf");

test.describe("PDF to PDF/A", () => {
  test("converts via Ghostscript and preserves page count and text", async ({ page }) => {
    await page.goto("/pdf-to-pdfa");
    await expect(page.getByRole("heading", { name: "PDF to PDF/A" })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_3PAGE);
    await page.getByRole("radio", { name: "PDF/A-1b" }).click();

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/convert/pdf-to-pdfa/") && res.request().method() === "POST"),
      page.getByRole("button", { name: "Convert to PDF/A" }).click(),
    ]);
    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: /Your PDF is now PDF\/A-1B/ })).toBeVisible({ timeout: 20_000 });

    const body = await response.json();
    expect(body.data.pdfa_standard).toBe("PDF/A-1B");
    expect(body.data.page_count).toBe(3);

    const fetched = await page.request.get(body.data.download_url);
    const outPath = path.join(__dirname, ".tmp-pdf-to-pdfa.pdf");
    await fs.writeFile(outPath, await fetched.body());

    const facts = inspectPdf(outPath);
    expect(facts.page_count).toBe(3);
    expect(facts.texts[0]).toContain("PAGE ONE");
  });
});
