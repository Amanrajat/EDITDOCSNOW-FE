import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { inspectPdf } from "./utils/verify-pdf";

test.describe("HTML to PDF", () => {
  test("renders raw HTML into a real PDF", async ({ page }) => {
    await page.goto("/html-to-pdf");
    await expect(page.getByRole("heading", { name: "HTML to PDF" })).toBeVisible();

    await page.getByRole("radio", { name: "Raw HTML" }).click();
    await page.getByLabel("HTML").fill("<h1>Invoice #42</h1><p>Total due: $100</p>");

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/convert/html-to-pdf/") && res.request().method() === "POST"),
      page.getByRole("button", { name: "Convert to PDF" }).click(),
    ]);
    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Your PDF is ready" })).toBeVisible({ timeout: 15_000 });

    const body = await response.json();
    const fetched = await page.request.get(body.data.download_url);
    const outPath = path.join(__dirname, ".tmp-html-to-pdf.pdf");
    await fs.writeFile(outPath, await fetched.body());

    const facts = inspectPdf(outPath);
    expect(facts.page_count).toBeGreaterThanOrEqual(1);
    expect(facts.texts[0]).toContain("Invoice #42");
    expect(facts.texts[0]).toContain("Total due: $100");
  });

  test("blocks a request to a private/internal URL", async ({ page }) => {
    await page.goto("/html-to-pdf");
    // Default mode is already "Webpage URL".
    await page.getByLabel("URL").fill("http://127.0.0.1/admin");

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/convert/html-to-pdf/") && res.request().method() === "POST"),
      page.getByRole("button", { name: "Convert to PDF" }).click(),
    ]);
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error_code).toBe("BLOCKED_URL");

    await expect(page.getByRole("main").getByText(/private\/internal\/reserved/i)).toBeVisible({ timeout: 5_000 });
  });
});
