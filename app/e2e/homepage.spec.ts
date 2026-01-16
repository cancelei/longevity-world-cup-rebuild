import { test, expect } from "@playwright/test";

/**
 * Homepage E2E Tests
 * Tests the main landing page functionality and user experience
 */

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the hero section", async ({ page }) => {
    // Check for main heading
    await expect(page.locator("h1")).toContainText("Longevity");
    await expect(page.locator("h1")).toContainText("World Cup");

    // Check for call-to-action buttons (use first() to avoid strict mode)
    await expect(page.getByRole("button", { name: /join competition/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /learn more/i })).toBeVisible();
  });

  test("should display statistics section", async ({ page }) => {
    // Check for stat items - use first() to avoid strict mode issues
    await expect(page.getByText("Athletes").first()).toBeVisible();
    await expect(page.getByText("Season").first()).toBeVisible();
    await expect(page.getByText("Prize Pool").first()).toBeVisible();
  });

  test("should display prize pool section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /prize pool/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /donate/i })).toBeVisible();
  });

  test("should display leaderboard section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /leaderboard/i })).toBeVisible();

    // Wait for leaderboard data to load
    await page.waitForTimeout(2000);

    // Check for view all button
    await expect(page.getByRole("button", { name: /view all/i })).toBeVisible();
  });

  test("should navigate to about page", async ({ page }) => {
    await page.getByRole("button", { name: /learn more/i }).click();
    await expect(page).toHaveURL("/about");
    await expect(page.getByRole("heading", { name: /about/i })).toBeVisible();
  });

  test("should have a responsive layout", async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("h1")).toBeVisible();

    // Test on tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator("h1")).toBeVisible();

    // Test on desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator("h1")).toBeVisible();
  });
});
