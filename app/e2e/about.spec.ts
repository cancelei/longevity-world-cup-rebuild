import { test, expect } from "@playwright/test";

/**
 * About Page E2E Tests
 * Tests the about page content and navigation
 */

test.describe("About Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about");
  });

  test("should display the about page heading", async ({ page }) => {
    // The actual page title is "The Scoreboard for Longevity"
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Scoreboard/i);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Longevity/i);
  });

  test("should display the mission section", async ({ page }) => {
    // The actual heading is "Why We Built This"
    await expect(page.getByRole("heading", { name: /why we built this/i })).toBeVisible();
    await expect(page.getByText(/measurement problem/i)).toBeVisible();
  });

  test("should display how it works section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /how it works/i })).toBeVisible();

    // Check for actual feature cards (use exact match to avoid multiple matches)
    await expect(page.getByRole("heading", { name: "Know Your Real Age" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "See Where You Rank", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Join the Longevity Elite" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Watch Your Age Drop" })).toBeVisible();
  });

  test("should display PhenoAge section", async ({ page }) => {
    // The actual heading is "The Science: PhenoAge"
    await expect(page.getByRole("heading", { name: /science.*phenoage/i })).toBeVisible();
    await expect(page.getByText(/9 required biomarkers/i)).toBeVisible();

    // Check for biomarker list
    await expect(page.getByText("Albumin")).toBeVisible();
    await expect(page.getByText("Creatinine")).toBeVisible();
    await expect(page.getByText("Glucose")).toBeVisible();
  });

  test("should display competition structure", async ({ page }) => {
    // The actual heading is "Competition Structure"
    await expect(page.getByRole("heading", { name: /competition structure/i })).toBeVisible();
    await expect(page.getByText(/individual rankings/i)).toBeVisible();
    await expect(page.getByText(/league rankings/i)).toBeVisible();
  });

  test("should have call-to-action buttons", async ({ page }) => {
    // The actual buttons are "Get Your Biological Age" and "Create a League"
    await expect(page.getByRole("button", { name: /get your biological age/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /create a league/i })).toBeVisible();
  });

  test("should navigate to sign-up from CTA", async ({ page }) => {
    await page.getByRole("button", { name: /get your biological age/i }).click();
    // May redirect to sign-up or onboarding
    await expect(page).toHaveURL(/\/(sign-up|onboarding)/);
  });

  test("should navigate to create league page", async ({ page }) => {
    await page.getByRole("button", { name: /create a league/i }).click();
    await expect(page).toHaveURL(/\/leagues\/new/);
  });
});
