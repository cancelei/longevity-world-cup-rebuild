import { test, expect } from "@playwright/test";

/**
 * Athletes Page E2E Tests
 * Tests the athletes listing and filtering functionality
 */

test.describe("Athletes Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/athletes");
  });

  test("should display the athletes page heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /athletes/i })).toBeVisible();
    await expect(page.getByText(/meet the competitors/i)).toBeVisible();
  });

  test("should display search and filter controls", async ({ page }) => {
    await expect(page.getByPlaceholder(/search athletes/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /apply/i })).toBeVisible();
  });

  test("should load and display athlete cards", async ({ page }) => {
    // Wait for athletes to load
    await page.waitForTimeout(2000);

    // Check that athlete cards are displayed by looking for verified badges
    const verifiedBadges = page.getByText("Verified");
    await expect(verifiedBadges.first()).toBeVisible({ timeout: 10000 });
  });

  test("should filter athletes by search", async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(1000);

    // Type in search
    await page.getByPlaceholder(/search athletes/i).fill("Bryan");
    await page.getByRole("button", { name: /apply/i }).click();

    // Wait for filtered results
    await page.waitForTimeout(1000);
  });

  test("should filter athletes by division", async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(1000);

    // Select division
    const divisionSelect = page.locator("select").first();
    await divisionSelect.selectOption("WOMENS");

    // Wait for filtered results
    await page.waitForTimeout(1000);
  });

  test("should navigate to athlete profile on click", async ({ page }) => {
    // Wait for athletes to load
    await page.waitForTimeout(3000);

    // Click on an athlete card (cards use onClick handlers)
    const firstCard = page.locator('[class*="cursor-pointer"]').filter({ hasText: /verified/i }).first();
    await firstCard.click();

    // Should navigate to athlete profile
    await expect(page).toHaveURL(/\/athletes\/[a-z-]+/, { timeout: 10000 });
  });

  test("should display athlete statistics", async ({ page }) => {
    // Wait for athletes to load
    await page.waitForTimeout(2000);

    // Check for athlete stats labels
    await expect(page.getByText("Age").first()).toBeVisible();
    await expect(page.getByText("Reduction").first()).toBeVisible();
    await expect(page.getByText("Rank").first()).toBeVisible();
  });

  test("should show verified badge for verified athletes", async ({ page }) => {
    // Wait for athletes to load
    await page.waitForTimeout(2000);

    // Check for verified badges
    const verifiedBadges = page.getByText("Verified");
    await expect(verifiedBadges.first()).toBeVisible();
  });
});
