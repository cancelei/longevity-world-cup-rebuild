import { test, expect } from "@playwright/test";

/**
 * Rules Page E2E Tests
 * Tests the competition rules page content
 */

test.describe("Rules Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/rules");
  });

  test("should display the rules page heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /competition rules/i })).toBeVisible();
  });

  test("should display quick summary section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /quick summary/i })).toBeVisible();
    await expect(page.getByText(/submit biomarkers/i)).toBeVisible();
    await expect(page.getByText(/get verified/i)).toBeVisible();
    await expect(page.getByText(/compete & win/i)).toBeVisible();
  });

  test("should display detailed rules", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /detailed rules/i })).toBeVisible();

    // Check for rule section headings
    await expect(page.getByRole("heading", { name: /eligibility/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /biomarker submission/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /verification process/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /rankings/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /season structure/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /fair play/i })).toBeVisible();
  });

  test("should display required biomarkers table", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /required biomarkers/i })).toBeVisible();

    // Check for table headers using role
    await expect(page.getByRole("columnheader", { name: "Biomarker" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Unit" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Normal Range" })).toBeVisible();

    // Check for specific biomarkers in table cells
    await expect(page.getByRole("cell", { name: "Albumin" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "g/dL" }).first()).toBeVisible();
  });

  test("should display prize distribution section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /prize distribution/i })).toBeVisible();
    await expect(page.getByText("1st Place")).toBeVisible();
    await expect(page.getByText("2nd Place")).toBeVisible();
    await expect(page.getByText("3rd Place")).toBeVisible();
    await expect(page.getByText("60%")).toBeVisible();
    await expect(page.getByText("25%")).toBeVisible();
    await expect(page.getByText("15%")).toBeVisible();
  });

  test("should display dispute resolution section", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /dispute resolution/i })).toBeVisible();
    await expect(page.getByText(/organizing committee/i).first()).toBeVisible();
  });

  test("should have call-to-action buttons", async ({ page }) => {
    await expect(page.getByRole("button", { name: /join the competition/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /view athletes/i })).toBeVisible();
  });

  test("should navigate to athletes page", async ({ page }) => {
    await page.getByRole("button", { name: /view athletes/i }).click();
    await expect(page).toHaveURL("/athletes");
  });
});
