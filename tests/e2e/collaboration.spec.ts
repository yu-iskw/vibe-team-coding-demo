import { test, expect, BrowserContext } from "@playwright/test";

/**
 * Collaboration test suite for multi-user canvas editing
 *
 * This test verifies that real-time collaboration works between different browser sessions
 * using separate browser contexts to simulate multiple users.
 *
 * Note: These tests are scaffold tests that verify the multi-browser setup.
 * Full collaboration testing requires a running websocket server for Yjs synchronization.
 */
test.describe("Collaborative Canvas Editing", () => {
  test("Multi-browser context setup works", async ({ browser }) => {
    // Create two separate browser contexts to simulate different users
    const contextA: BrowserContext = await browser.newContext();
    const contextB: BrowserContext = await browser.newContext();

    // Create pages for each user
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    try {
      // Navigate both users to the application
      await pageA.goto("/");
      await pageB.goto("/");

      // Verify both users can see the canvas container
      const canvasA = pageA.locator(".canvas-container");
      const canvasB = pageB.locator(".canvas-container");

      await expect(canvasA).toBeVisible();
      await expect(canvasB).toBeVisible();

      // Verify both users have the Add Node button
      const addNodeButtonA = pageA.locator('button:has-text("Add Node")');
      const addNodeButtonB = pageB.locator('button:has-text("Add Node")');

      await expect(addNodeButtonA).toBeVisible();
      await expect(addNodeButtonB).toBeVisible();
      await expect(addNodeButtonA).toBeEnabled();
      await expect(addNodeButtonB).toBeEnabled();

      // Verify canvas elements exist (Konva creates canvas elements)
      const canvasElementsA = pageA.locator(".canvas-container canvas");
      const canvasElementsB = pageB.locator(".canvas-container canvas");

      // Should have four canvas elements (EdgeLayer, NodeLayer, SelectionLayer, AwarenessLayer)
      await expect(canvasElementsA).toHaveCount(4);
      await expect(canvasElementsB).toHaveCount(4);

      // User A clicks "Add Node" - this should work without errors
      await addNodeButtonA.click();

      // Verify the button is still visible and enabled after click
      await expect(addNodeButtonA).toBeVisible();
      await expect(addNodeButtonA).toBeEnabled();

      // User B's button should still be functional
      await expect(addNodeButtonB).toBeVisible();
      await expect(addNodeButtonB).toBeEnabled();

      console.log(
        "✅ Multi-browser context test passed: Both users can interact with the canvas independently",
      );
    } finally {
      // Clean up contexts
      await contextA.close();
      await contextB.close();
    }
  });

  test("Simultaneous multi-user session setup", async ({ browser }) => {
    // Create three separate browser contexts
    const contextA: BrowserContext = await browser.newContext();
    const contextB: BrowserContext = await browser.newContext();
    const contextC: BrowserContext = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();
    const pageC = await contextC.newPage();

    try {
      // Navigate all users to the application simultaneously
      await Promise.all([pageA.goto("/"), pageB.goto("/"), pageC.goto("/")]);

      // All users should see the canvas container
      const canvases = [
        pageA.locator(".canvas-container"),
        pageB.locator(".canvas-container"),
        pageC.locator(".canvas-container"),
      ];

      await Promise.all(canvases.map((canvas) => expect(canvas).toBeVisible()));

      // All users should have functional Add Node buttons
      const addButtons = [
        pageA.locator('button:has-text("Add Node")'),
        pageB.locator('button:has-text("Add Node")'),
        pageC.locator('button:has-text("Add Node")'),
      ];

      await Promise.all(
        addButtons.map((button) => expect(button).toBeVisible()),
      );
      await Promise.all(
        addButtons.map((button) => expect(button).toBeEnabled()),
      );

      // All users can click Add Node simultaneously without errors
      await Promise.all(addButtons.map((button) => button.click()));

      // Verify all buttons are still functional after clicking
      await Promise.all(
        addButtons.map((button) => expect(button).toBeVisible()),
      );
      await Promise.all(
        addButtons.map((button) => expect(button).toBeEnabled()),
      );

      console.log(
        "✅ Simultaneous multi-user session test passed: All 3 users can interact simultaneously",
      );
    } finally {
      await Promise.all([contextA.close(), contextB.close(), contextC.close()]);
    }
  });

  test("Browser isolation between contexts", async ({ browser }) => {
    // Test that separate contexts maintain isolation
    const contextA: BrowserContext = await browser.newContext();
    const contextB: BrowserContext = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    try {
      // Navigate to different URLs to verify complete isolation
      await pageA.goto("/");
      await pageB.goto("/");

      // Set local storage in context A
      await pageA.evaluate(() => {
        localStorage.setItem("test-isolation", "user-a-data");
      });

      // Context B should not see context A's local storage
      const contextBStorage = await pageB.evaluate(() => {
        return localStorage.getItem("test-isolation");
      });

      expect(contextBStorage).toBeNull();

      // Both contexts should still function independently
      const buttonA = pageA.locator('button:has-text("Add Node")');
      const buttonB = pageB.locator('button:has-text("Add Node")');

      await expect(buttonA).toBeVisible();
      await expect(buttonB).toBeVisible();

      await buttonA.click();
      await buttonB.click();

      // Both should still be functional
      await expect(buttonA).toBeVisible();
      await expect(buttonB).toBeVisible();

      console.log(
        "✅ Browser isolation test passed: Contexts maintain complete isolation",
      );
    } finally {
      await contextA.close();
      await contextB.close();
    }
  });
});
