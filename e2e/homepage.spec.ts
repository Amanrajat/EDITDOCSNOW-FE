import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("hero primary CTA links to /upload", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Upload PDF" }).first()).toHaveAttribute("href", "/upload");
  });

  test("hero secondary CTA links to /tools", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Explore PDF Tools" })).toHaveAttribute("href", "/tools");
  });

  test("tool category cards link to real tool routes", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /Merge PDF/ }).first()).toHaveAttribute("href", "/merge");
    await expect(page.getByRole("link", { name: /Compress PDF/ }).first()).toHaveAttribute("href", "/compress");
    await expect(page.getByRole("link", { name: /Advanced PDF Editor/ }).first()).toHaveAttribute("href", "/upload");
  });

  test("FAQ accordion opens and closes", async ({ page }) => {
    await page.goto("/");

    const question = page.getByRole("button", { name: "Do I need to create an account?" });
    await question.scrollIntoViewIfNeeded();

    const answer = page.getByText("No. Upload a file and start using any tool right away");
    await expect(answer).toBeHidden();

    await question.click();
    await expect(answer).toBeVisible();

    await question.click();
    await expect(answer).toBeHidden();
  });

  test("footer renders multiple columns with real links", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: "Merge PDF" })).toHaveAttribute("href", "/merge");
    await expect(footer.getByRole("link", { name: "PDF to Word" })).toHaveAttribute("href", "/pdf-to-word");
    await expect(footer.getByRole("link", { name: "How It Works" })).toHaveAttribute("href", "/how-it-works");
    await expect(footer.getByText(/EditDocsNow\. All rights reserved\./)).toBeVisible();
  });
});
