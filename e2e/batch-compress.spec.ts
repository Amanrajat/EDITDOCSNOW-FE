import path from "node:path";
import { test, expect } from "@playwright/test";
import AdmZip from "adm-zip";

const FIXTURE_IMAGE_HEAVY = path.join(__dirname, "fixtures", "sample-image-heavy.pdf");
const FIXTURE_3PAGE = path.join(__dirname, "fixtures", "sample-3page.pdf");
const FIXTURE_1PAGE = path.join(__dirname, "fixtures", "sample-1page.pdf");
const FIXTURE_CORRUPTED = path.join(__dirname, "fixtures", "corrupted.pdf");

test.describe("Batch Compress", () => {
  test.beforeAll(async () => {
    const fs = await import("node:fs/promises");
    await fs.writeFile(FIXTURE_CORRUPTED, "not a real pdf");
  });

  test("compresses multiple real PDFs in the background and produces a real ZIP", async ({ page }) => {
    await page.goto("/batch-compress");
    await expect(page.getByRole("heading", { name: "Batch Compress", exact: true })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles([FIXTURE_IMAGE_HEAVY, FIXTURE_3PAGE]);
    await expect(page.getByText("2 files", { exact: true })).toBeVisible();

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/api/v1/pdf/batch/compress/") && res.request().method() === "POST"),
      page.getByRole("button", { name: /Compress 2 files/ }).click(),
    ]);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    // Submission itself must return before processing finishes - this is
    // genuinely async, not a synchronous call dressed up as one.
    expect(["queued", "processing"]).toContain(body.data.status);

    await expect(page.getByText("Your batch is ready")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("2 of 2 completed")).toBeVisible();

    const downloadButton = page.getByRole("button", { name: "Download ZIP" });
    await expect(downloadButton).toBeVisible();

    const statusResponse = await page.request.get(
      `http://localhost:8010/api/v1/pdf/batch/${body.data.batch_id}/status/?token=${body.data.owner_token}`,
    );
    const statusBody = (await statusResponse.json()).data;
    expect(statusBody.status).toBe("completed");
    expect(statusBody.completed_count).toBe(2);

    const fetched = await page.request.get(statusBody.download_url);
    expect(fetched.ok()).toBeTruthy();
    const buffer = await fetched.body();
    const zip = new AdmZip(buffer);
    const entryNames = zip.getEntries().map((e) => e.entryName).sort();
    expect(entryNames).toEqual(["sample-3page.pdf", "sample-image-heavy.pdf"]);

    // The zipped image-heavy file must actually be the compressed
    // version, not a copy of the 7MB original.
    const compressedEntry = zip.getEntries().find((e) => e.entryName === "sample-image-heavy.pdf");
    expect(compressedEntry?.header.size).toBeLessThan(1_000_000);
  });

  test("isolates a corrupted file - the rest of the batch still succeeds", async ({ page }) => {
    await page.goto("/batch-compress");
    await page.locator('input[type="file"]').setInputFiles([FIXTURE_1PAGE, FIXTURE_CORRUPTED]);
    await expect(page.getByText("2 files", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: /Compress 2 files/ }).click();

    await expect(page.getByText(/1 of 2 completed/)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("1 failed")).toBeVisible();

    const rows = page.locator("li", { hasText: "corrupted.pdf" });
    await expect(rows.getByText("Failed")).toBeVisible();

    const goodRow = page.locator("li", { hasText: "sample-1page.pdf" });
    await expect(goodRow.getByText("Done")).toBeVisible();

    // Even a partially-failed batch must still offer a real download of
    // whatever succeeded.
    await expect(page.getByRole("button", { name: "Download ZIP" })).toBeVisible();
  });
});
