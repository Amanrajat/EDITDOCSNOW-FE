import path from "node:path";
import fs from "node:fs/promises";
import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";

const FIXTURE_3PAGE = path.join(__dirname, "fixtures", "sample-3page.pdf");

const BACKEND_PYTHON = path.join(__dirname, "../../EDITDOCSNOW-BE", ".venv", "bin", "python");

function findLabel(filePath: string, pageIndex: number, label: string): boolean {
  const script = `
import sys, json
import fitz
doc = fitz.open(sys.argv[1])
rects = doc[int(sys.argv[2])].search_for(sys.argv[3])
print(json.dumps(bool(rects)))
`;
  const out = execFileSync(BACKEND_PYTHON, ["-c", script, filePath, String(pageIndex), label], {
    encoding: "utf-8",
  });
  return JSON.parse(out);
}

test.describe("Page Numbers", () => {
  test("adds sequential numbers to every page at the default position", async ({ page }) => {
    await page.goto("/page-numbers");
    await expect(page.getByRole("heading", { name: "Page Numbers", exact: true })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(FIXTURE_3PAGE);
    await expect(page.locator("[data-page-number-preview]")).toBeVisible();

    const submitButton = page.getByRole("button", { name: "Add page numbers" });
    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/page-numbers/") && res.request().method() === "POST"),
      submitButton.click(),
    ]);
    expect(response.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Page numbers added", exact: true })).toBeVisible({ timeout: 15_000 });

    const body = await response.json();
    expect(body.data.page_count).toBe(3);
    expect(body.data.numbered_pages).toEqual([1, 2, 3]);

    const fetched = await page.request.get(body.data.download_url);
    const outPath = path.join(__dirname, ".tmp-page-numbers-default.pdf");
    await fs.writeFile(outPath, await fetched.body());

    expect(findLabel(outPath, 0, "1")).toBe(true);
    expect(findLabel(outPath, 1, "2")).toBe(true);
    expect(findLabel(outPath, 2, "3")).toBe(true);
  });

  test("custom prefix/suffix, start number, and position are applied to selected pages only", async ({ page }) => {
    await page.goto("/page-numbers");
    await page.locator('input[type="file"]').setInputFiles(FIXTURE_3PAGE);
    await expect(page.locator("[data-page-number-preview]")).toBeVisible();

    await page.getByRole("button", { name: "Top right" }).click();
    await page.getByLabel("Start number").fill("5");
    await page.getByLabel("Prefix").fill("Page ");
    await page.getByLabel("Suffix").fill(" of 2");

    // Only number pages 2 and 3.
    await page.getByRole("button", { name: "Select page 2" }).click();
    await page.getByRole("button", { name: "Select page 3" }).click();
    await expect(page.getByText("Number 2 selected pages")).toBeVisible();

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/page-numbers/") && res.request().method() === "POST"),
      page.getByRole("button", { name: "Add page numbers" }).click(),
    ]);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.data.numbered_pages).toEqual([2, 3]);
    expect(body.data.position).toBe("top-right");

    const fetched = await page.request.get(body.data.download_url);
    const outPath = path.join(__dirname, ".tmp-page-numbers-custom.pdf");
    await fs.writeFile(outPath, await fetched.body());

    // Sequential across the SELECTED set: page 2 -> "Page 5 of 2", page 3 -> "Page 6 of 2".
    expect(findLabel(outPath, 1, "Page 5 of 2")).toBe(true);
    expect(findLabel(outPath, 2, "Page 6 of 2")).toBe(true);
    // Untouched page 1 must not have picked up a stray label.
    expect(findLabel(outPath, 0, "Page 5 of 2")).toBe(false);
  });
});
