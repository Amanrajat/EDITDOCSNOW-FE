import path from "node:path";
import fs from "node:fs/promises";
import { test, expect, type Page } from "@playwright/test";
import { inspectPdf } from "./utils/verify-pdf";

const FIXTURE_PDF = path.join(__dirname, "fixtures", "sample-1page.pdf");
const FIXTURE_IMAGE = path.join(__dirname, "fixtures", "red.jpg");

async function uploadAndOpenEditor(page: Page): Promise<string> {
  await page.goto("/upload");
  await page.locator('input[type="file"]').setInputFiles(FIXTURE_PDF);
  await page.waitForURL(/\/editor\/.+/, { timeout: 15_000 });
  const documentId = page.url().split("/editor/")[1];
  if (!documentId) throw new Error("expected to land on /editor/<id>");

  // Wait for the objects layer to mount (confirms extract + object list load completed).
  await expect(page.locator("[data-objects-layer]")).toBeVisible({ timeout: 15_000 });
  return documentId;
}

test.describe("Advanced PDF editor - objects", () => {
  test("add every object type, move/resize/rotate, undo/redo, duplicate, delete, save, and verify the real PDF", async ({
    page,
  }) => {
    await uploadAndOpenEditor(page);

    const layer = page.locator("[data-objects-layer]");
    const layerBox = await layer.boundingBox();
    if (!layerBox) throw new Error("objects layer not visible");

    // --- Rectangle: drag-to-size ---
    await page.getByRole("button", { name: "Add rectangle" }).click();
    await page.mouse.move(layerBox.x + 60, layerBox.y + 60);
    await page.mouse.down();
    await page.mouse.move(layerBox.x + 220, layerBox.y + 160, { steps: 10 });
    await page.mouse.up();

    const rectangle = page.locator('[data-object-type="rectangle"]');
    await expect(rectangle).toBeVisible();

    // --- Text: click-to-place, then double-click to edit its content ---
    await page.getByRole("button", { name: "Add text" }).click();
    await page.mouse.click(layerBox.x + 300, layerBox.y + 60);

    const textObject = page.locator('[data-object-type="text"]');
    await expect(textObject).toBeVisible();
    await textObject.dblclick();
    const textarea = textObject.locator("textarea");
    await textarea.fill("Hello from the object editor");
    await page.keyboard.press("Escape");

    // --- Freehand path: multi-point drag ---
    await page.getByRole("button", { name: "Draw freehand" }).click();
    await page.mouse.move(layerBox.x + 60, layerBox.y + 300);
    await page.mouse.down();
    await page.mouse.move(layerBox.x + 100, layerBox.y + 260, { steps: 5 });
    await page.mouse.move(layerBox.x + 140, layerBox.y + 320, { steps: 5 });
    await page.mouse.move(layerBox.x + 180, layerBox.y + 270, { steps: 5 });
    await page.mouse.up();
    await expect(page.locator('[data-object-type="path"]')).toBeVisible();

    // --- Image: canvas click opens the (intercepted) native file dialog ---
    await page.getByRole("button", { name: "Add image" }).click();
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.mouse.click(layerBox.x + 400, layerBox.y + 400);
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(FIXTURE_IMAGE);
    await expect(page.locator('[data-object-type="image"]')).toBeVisible();

    // --- Select tool: move the rectangle by dragging its body ---
    await page.getByRole("button", { name: "Select" }).click();
    const rectBoxBefore = await rectangle.boundingBox();
    if (!rectBoxBefore) throw new Error("rectangle not visible");
    await page.mouse.move(rectBoxBefore.x + rectBoxBefore.width / 2, rectBoxBefore.y + rectBoxBefore.height / 2);
    await page.mouse.down();
    await page.mouse.move(rectBoxBefore.x + rectBoxBefore.width / 2 + 40, rectBoxBefore.y + rectBoxBefore.height / 2 + 20, {
      steps: 8,
    });
    await page.mouse.up();
    const rectBoxAfterMove = await rectangle.boundingBox();
    if (!rectBoxAfterMove) throw new Error("rectangle not visible after move");
    expect(Math.abs(rectBoxAfterMove.x - rectBoxBefore.x)).toBeGreaterThan(15);

    // --- Resize via the se corner handle ---
    const seHandle = rectangle.locator('[data-resize-handle="se"]');
    await expect(seHandle).toBeVisible();
    const handleBox = await seHandle.boundingBox();
    if (!handleBox) throw new Error("resize handle not visible");
    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(handleBox.x + 50, handleBox.y + 50, { steps: 8 });
    await page.mouse.up();
    const rectBoxAfterResize = await rectangle.boundingBox();
    if (!rectBoxAfterResize) throw new Error("rectangle not visible after resize");
    expect(rectBoxAfterResize.width).toBeGreaterThan(rectBoxAfterMove.width + 20);

    // --- Rotate via the rotate handle ---
    const rotateHandle = rectangle.locator("[data-rotate-handle]");
    const rotateBox = await rotateHandle.boundingBox();
    if (!rotateBox) throw new Error("rotate handle not visible");
    await page.mouse.move(rotateBox.x + rotateBox.width / 2, rotateBox.y + rotateBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(rotateBox.x + 60, rotateBox.y + 40, { steps: 8 });
    await page.mouse.up();

    // --- Undo the rotation, then redo it ---
    await page.keyboard.press("Control+z");
    await page.keyboard.press("Control+Shift+z");

    // --- Duplicate the selected rectangle, then delete the duplicate ---
    await rectangle.click();
    await page.keyboard.press("Control+d");
    await expect(page.locator('[data-object-type="rectangle"]')).toHaveCount(2);
    await page.keyboard.press("Delete");
    await expect(page.locator('[data-object-type="rectangle"]')).toHaveCount(1);

    // --- Save: reconciles objects with the backend, then regenerates the PDF ---
    const [saveResponse] = await Promise.all([
      page.waitForResponse((res) => res.url().includes("/save/") && res.request().method() === "POST"),
      page.getByRole("button", { name: "Save" }).click(),
    ]);
    expect(saveResponse.ok()).toBeTruthy();
    const body = await saveResponse.json();

    const fetched = await page.request.get(body.download_url);
    expect(fetched.ok()).toBeTruthy();
    const outPath = path.join(__dirname, ".tmp-docs-editor-objects.pdf");
    await fs.writeFile(outPath, await fetched.body());

    const facts = inspectPdf(outPath);
    expect(facts.page_count).toBe(1);
    expect(facts.texts[0]).toContain("Hello from the object editor");
    expect(facts.images[0]).toBe(1);
    // Rectangle + freehand path = at least 2 distinct drawing groups.
    expect(facts.drawings[0]).toBeGreaterThanOrEqual(2);
  });
});
