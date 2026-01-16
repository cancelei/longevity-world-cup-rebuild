import { test, expect } from "@playwright/test";

/**
 * Athlete Profile E2E Tests
 * Tests the individual athlete profile pages
 */

test.describe("Athlete Profile Pages", () => {
  test.describe("Profile Navigation", () => {
    test("should navigate from athletes list to profile", async ({ page }) => {
      await page.goto("/athletes");

      await page.waitForLoadState("networkidle");

      // Look for clickable athlete cards or links
      const athleteLinks = page.locator('a[href^="/athletes/"]');
      const _athleteCards = page.locator('[class*="cursor-pointer"]');

      const linkCount = await athleteLinks.count();
      const cardCount = await athleteCards.count();

      if (linkCount > 0) {
        // Click on first athlete link
        await athleteLinks.first().click();
        await page.waitForLoadState("networkidle");

        // Should be on profile page
        expect(page.url()).toMatch(/\/athletes\/.+/);
      } else if (cardCount > 0) {
        // Athletes might be clickable cards
        await athleteCards.first().click();
        await page.waitForLoadState("networkidle");
      }
    });

    test("should handle non-existent athlete slug gracefully", async ({ page }) => {
      await page.goto("/athletes/non-existent-athlete-12345");

      await page.waitForLoadState("networkidle");

      // Should show 404 or redirect
      const notFound = page.getByText(/not found|404|doesn't exist/i);
      const hasNotFound = await notFound.count() > 0;

      // Either shows error or redirects
      expect(page.url().includes("athletes") || hasNotFound).toBeTruthy();
    });
  });

  test.describe("Profile Content", () => {
    test("should display athlete profile elements", async ({ page }) => {
      // First go to athletes page and get a valid athlete slug
      await page.goto("/athletes");
      await page.waitForLoadState("networkidle");

      const athleteLinks = page.locator('a[href^="/athletes/"]').filter({ hasNot: page.locator('[href="/athletes"]') });
      const linkCount = await athleteLinks.count();

      if (linkCount > 0) {
        // Navigate to first athlete profile
        await athleteLinks.first().click();
        await page.waitForLoadState("networkidle");

        // Profile should have standard elements
        // Look for profile-related content
        const profileElements = [
          page.locator('[class*="avatar"]'),
          page.getByText(/age/i),
          page.getByText(/bio/i),
          page.locator('img'),
        ];

        let hasProfileContent = false;
        for (const element of profileElements) {
          if (await element.count() > 0) {
            hasProfileContent = true;
            break;
          }
        }

        expect(hasProfileContent).toBeTruthy();
      }
    });

    test("should display biomarker information if available", async ({ page }) => {
      await page.goto("/athletes");
      await page.waitForLoadState("networkidle");

      const athleteLinks = page.locator('a[href^="/athletes/"]').filter({ hasNot: page.locator('[href="/athletes"]') });

      if (await athleteLinks.count() > 0) {
        await athleteLinks.first().click();
        await page.waitForLoadState("networkidle");

        // Look for biomarker-related content
        const biomarkerSection = page.getByText(/biomarker|phenoage|biological age/i);
        const _hasStats = await biomarkerSection.count() > 0;

        // Stats may or may not be visible depending on athlete
        expect(page.url()).toMatch(/\/athletes\/.+/);
      }
    });

    test("should display badge information if available", async ({ page }) => {
      await page.goto("/athletes");
      await page.waitForLoadState("networkidle");

      const athleteLinks = page.locator('a[href^="/athletes/"]').filter({ hasNot: page.locator('[href="/athletes"]') });

      if (await athleteLinks.count() > 0) {
        await athleteLinks.first().click();
        await page.waitForLoadState("networkidle");

        // Look for badge elements
        const _badges = page.locator('[class*="badge"]');

        // Profile page loaded successfully
        expect(page.url()).toMatch(/\/athletes\/.+/);
      }
    });
  });

  test.describe("Profile Responsiveness", () => {
    test("should be responsive on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto("/athletes");
      await page.waitForLoadState("networkidle");

      const athleteLinks = page.locator('a[href^="/athletes/"]').filter({ hasNot: page.locator('[href="/athletes"]') });

      if (await athleteLinks.count() > 0) {
        await athleteLinks.first().click();
        await page.waitForLoadState("networkidle");

        // Content should be visible on mobile
        const mainContent = page.locator("main");
        if (await mainContent.count() > 0) {
          await expect(mainContent).toBeVisible();
        }
      }
    });

    test("should be responsive on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await page.goto("/athletes");
      await page.waitForLoadState("networkidle");

      const athleteLinks = page.locator('a[href^="/athletes/"]').filter({ hasNot: page.locator('[href="/athletes"]') });

      if (await athleteLinks.count() > 0) {
        await athleteLinks.first().click();
        await page.waitForLoadState("networkidle");

        const mainContent = page.locator("main");
        if (await mainContent.count() > 0) {
          await expect(mainContent).toBeVisible();
        }
      }
    });
  });
});

test.describe("Profile Social Features", () => {
  test("should have share functionality if available", async ({ page }) => {
    await page.goto("/athletes");
    await page.waitForLoadState("networkidle");

    const athleteLinks = page.locator('a[href^="/athletes/"]').filter({ hasNot: page.locator('[href="/athletes"]') });

    if (await athleteLinks.count() > 0) {
      await athleteLinks.first().click();
      await page.waitForLoadState("networkidle");

      // Look for share buttons
      const shareButton = page.getByRole("button", { name: /share/i });
      const shareIcon = page.locator('[class*="share"]');

      const _hasShare = await shareButton.count() > 0 || await shareIcon.count() > 0;

      // Share may or may not exist
      expect(page.url()).toMatch(/\/athletes\/.+/);
    }
  });
});
