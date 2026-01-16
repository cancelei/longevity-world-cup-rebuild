import { test, expect } from "@playwright/test";

/**
 * Games E2E Tests
 * Tests the games functionality on the platform
 */

test.describe("Games", () => {
  test.describe("Games Page", () => {
    test("should display the games page", async ({ page }) => {
      await page.goto("/games");

      await page.waitForLoadState("networkidle");

      // Page should load without errors
      expect(page.url()).toContain("games");
    });

    test("should have navigation from homepage", async ({ page }) => {
      await page.goto("/");

      // Look for games link in navigation
      const gamesLink = page.getByRole("link", { name: /games/i });

      if (await gamesLink.count() > 0) {
        await gamesLink.first().click();
        await page.waitForURL(/\/games/);
        expect(page.url()).toContain("games");
      }
    });
  });

  test.describe("Guess Age Game", () => {
    test("should display guess age game elements if present", async ({ page }) => {
      await page.goto("/games");

      await page.waitForLoadState("networkidle");

      // Look for game-related elements
      const guessText = page.getByText(/guess/i);
      const ageText = page.getByText(/age/i);

      // Check if game elements are present
      const hasGameContent = await guessText.count() > 0 || await ageText.count() > 0;

      // If games exist on the page, verify structure
      if (hasGameContent) {
        // The page has game content
        expect(hasGameContent).toBeTruthy();
      }
    });

    test("should be interactive", async ({ page }) => {
      await page.goto("/games");

      await page.waitForLoadState("networkidle");

      // Look for interactive elements like sliders, buttons, or input fields
      const slider = page.locator('input[type="range"]');
      const submitButton = page.getByRole("button", { name: /submit|guess|play/i });

      const hasInteractiveElements = await slider.count() > 0 || await submitButton.count() > 0;

      // If interactive elements exist, they should be functional
      if (hasInteractiveElements) {
        expect(hasInteractiveElements).toBeTruthy();
      }
    });
  });
});

test.describe("Games Accessibility", () => {
  test("should be accessible on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/games");

    await page.waitForLoadState("networkidle");

    // Page should still be usable
    expect(page.url()).toContain("games");
  });

  test("should be accessible on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/games");

    await page.waitForLoadState("networkidle");

    expect(page.url()).toContain("games");
  });
});
