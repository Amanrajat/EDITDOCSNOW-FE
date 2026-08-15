import { test, expect } from "@playwright/test";

const BREAKPOINTS = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920];

test.describe("Navbar", () => {
  test("no horizontal overflow at any required breakpoint", async ({ page }) => {
    for (const width of BREAKPOINTS) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");

      // AppShell picks mobile-bar vs. desktop nav via a client-side media
      // query (no server-side UA hint, to keep every marketing page
      // statically generated) — so the very first paint briefly assumes
      // desktop before hydration corrects it. Wait for whichever nav mode
      // actually applies at this width before asserting, since that's the
      // steady state a real user sees and interacts with.
      const isMobileWidth = width < 1025;
      if (isMobileWidth) {
        await page.getByRole("button", { name: "Open navigation" }).waitFor({ state: "visible" });
      } else {
        await page.getByRole("button", { name: "PDF Tools" }).waitFor({ state: "visible" });
      }

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth, `overflow at ${width}px`).toBeLessThanOrEqual(clientWidth);
    }
  });

  test("desktop: PDF Tools dropdown opens on click and lists organize tools", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    await page.getByRole("button", { name: "PDF Tools" }).click();
    const panel = page.getByRole("group", { name: "PDF Tools" });
    await expect(panel.getByRole("link", { name: /Merge PDF/ })).toBeVisible();
    await expect(panel.getByRole("link", { name: /Split PDF/ })).toBeVisible();
    await expect(panel.getByRole("link", { name: /Organize PDF/ })).toBeVisible();
  });

  test("desktop: dropdown closes on outside click", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    await page.getByRole("button", { name: "PDF Tools" }).click();
    const panel = page.getByRole("group", { name: "PDF Tools" });
    await expect(panel).toBeVisible();

    await page.mouse.click(640, 700);
    await expect(panel).toBeHidden();
  });

  test("desktop: dropdown closes on Escape", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    await page.getByRole("button", { name: "Convert PDF" }).click();
    const panel = page.getByRole("group", { name: "Convert PDF" });
    await expect(panel).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
  });

  test("desktop: Convert PDF mega-menu shows both PDF→other and other→PDF groups", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    await page.getByRole("button", { name: "Convert PDF" }).click();
    const panel = page.getByRole("group", { name: "Convert PDF" });
    await expect(panel.getByText("PDF → Other Formats")).toBeVisible();
    await expect(panel.getByText("Other Formats → PDF")).toBeVisible();
    await expect(panel.getByRole("link", { name: /Word to PDF/ })).toBeVisible();
  });

  test("desktop: Edit PDF and Compress open as simple menus", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    await page.getByRole("button", { name: "Edit PDF" }).click();
    await expect(page.getByRole("menuitem", { name: /Advanced PDF Editor/ })).toBeVisible();

    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Compress" }).click();
    await expect(page.getByRole("menuitem", { name: /Batch Compress/ })).toBeVisible();
  });

  test("desktop: OCR is a direct link with active state on its own page", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/ocr");

    const ocrLink = page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "OCR", exact: true });
    await expect(ocrLink).toBeVisible();
    await expect(ocrLink).toHaveAttribute("aria-current", "page");
  });

  test("mobile (375px): hamburger opens a drawer with all six nav categories, collapsible", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");

    await expect(page.getByRole("button", { name: "PDF Tools" })).toBeHidden();

    const toggle = page.getByRole("button", { name: "Open navigation" });
    await toggle.click();

    const dialog = page.getByRole("dialog");
    for (const label of ["PDF Tools", "Convert PDF", "Edit PDF", "Compress", "OCR", "Resources"]) {
      await expect(dialog.getByText(label, { exact: true })).toBeVisible();
    }

    await dialog.getByText("PDF Tools", { exact: true }).click();
    await expect(dialog.getByRole("link", { name: /Merge PDF/ })).toBeVisible();
  });

  test("mobile (375px): drawer closes on Escape", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");

    await page.getByRole("button", { name: "Open navigation" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("navbar has exactly one Upload PDF CTA and no Home link", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    const nav = page.getByRole("navigation", { name: "Primary" });
    await expect(nav.getByRole("link", { name: "Upload PDF" })).toHaveCount(1);
    await expect(nav.getByRole("link", { name: "Home", exact: true })).toHaveCount(0);
  });
});
