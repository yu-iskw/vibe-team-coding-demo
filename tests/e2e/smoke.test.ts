import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("app loads and displays canvas", async ({ page }) => {
    // Navigate to the app
    await page.goto("/");

    // Check that the canvas container is present
    const canvasContainer = page.locator(".canvas-container");
    await expect(canvasContainer).toBeVisible();

    // Check that the controls are present
    const addNodeButton = page.locator('button:has-text("Add Node")');
    await expect(addNodeButton).toBeVisible();
    await expect(addNodeButton).toBeEnabled();

    // Verify the page title or basic app structure
    await expect(page).toHaveTitle("frontend"); // Vite project title
  });

  test("canvas is interactive", async ({ page }) => {
    await page.goto("/");

    // Click the Add Node button
    const addNodeButton = page.locator('button:has-text("Add Node")');
    await addNodeButton.click();

    // After clicking, we should still have the canvas and controls
    const canvasContainer = page.locator(".canvas-container");
    await expect(canvasContainer).toBeVisible();

    await expect(addNodeButton).toBeVisible();
  });
});
