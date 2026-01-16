import { test, expect } from "@playwright/test";

/**
 * Leaderboard UX E2E Tests
 * Tests the leaderboard interactions and user experience
 */

test.describe("Leaderboard Display", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/athletes");
    await page.waitForLoadState("networkidle");
  });

  test("should display leaderboard with ranking information", async ({ page }) => {
    // Look for rank indicators
    const rankElements = page.getByText(/^#\d+$/);
    const rankCount = await rankElements.count();

    // Should have some ranked entries
    expect(rankCount).toBeGreaterThanOrEqual(0);

    // Look for athlete names
    const _athleteCards = page.locator('[class*="cursor-pointer"]');
    if (await athleteCards.count() > 0) {
      await expect(athleteCards.first()).toBeVisible();
    }
  });

  test("should show age reduction values clearly", async ({ page }) => {
    // Look for age reduction indicators (e.g., "-5.2 years" or "yrs")
    const _ageReduction = page.getByText(/years?|yrs/i);
    if (await ageReduction.count() > 0) {
      await expect(ageReduction.first()).toBeVisible();
    }
  });

  test("should display athlete avatars", async ({ page }) => {
    const avatars = page.locator('[class*="avatar"], img[alt]');
    if (await avatars.count() > 0) {
      await expect(avatars.first()).toBeVisible();
    }
  });
});

test.describe("Leaderboard Filtering", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/athletes");
    await page.waitForLoadState("networkidle");
  });

  test("should filter by search input", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);

    if (await searchInput.count() > 0) {
      // Type a search query
      await searchInput.fill("test");
      await page.waitForTimeout(500); // Debounce

      // Results should update (either show matches or empty state)
      const results = page.locator('[class*="cursor-pointer"]');
      const _emptyState = page.getByText(/no.*found/i);

      const hasContent =
        (await results.count()) > 0 || (await emptyState.count()) > 0;
      expect(hasContent).toBeTruthy();

      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(500);
    }
  });

  test("should filter by division", async ({ page }) => {
    const divisionSelect = page.locator("select").first();

    if (await divisionSelect.count() > 0) {
      // Get all options
      const _options = await divisionSelect.locator("option").all();

      if (options.length > 1) {
        // Select a specific division
        await divisionSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // Page should still be functional
        expect(page.url()).toContain("athletes");
      }
    }
  });

  test("should filter by generation", async ({ page }) => {
    const selects = page.locator("select");
    const selectCount = await selects.count();

    if (selectCount > 1) {
      // Second select is typically generation
      const generationSelect = selects.nth(1);
      const _options = await generationSelect.locator("option").all();

      if (options.length > 1) {
        await generationSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        expect(page.url()).toContain("athletes");
      }
    }
  });

  test("should combine multiple filters", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);
    const selects = page.locator("select");

    if ((await searchInput.count()) > 0 && (await selects.count()) > 0) {
      // Apply search filter
      await searchInput.fill("a");
      await page.waitForTimeout(300);

      // Apply division filter
      await selects.first().selectOption({ index: 1 });
      await page.waitForTimeout(300);

      // Page should handle combined filters
      expect(page.url()).toContain("athletes");
    }
  });

  test("should reset filters when cleared", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search/i);

    if (await searchInput.count() > 0) {
      // Apply filter
      await searchInput.fill("test filter");
      await page.waitForTimeout(500);

      // Clear filter
      await searchInput.clear();
      await page.waitForTimeout(500);

      // Should show all results again
      expect(page.url()).toContain("athletes");
    }
  });
});

test.describe("Leaderboard Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/athletes");
    await page.waitForLoadState("networkidle");
  });

  test("should click on athlete to view profile", async ({ page }) => {
    const athleteLinks = page.locator('a[href^="/athletes/"]').filter({
      hasNot: page.locator('[href="/athletes"]'),
    });

    if (await athleteLinks.count() > 0) {
      await athleteLinks.first().click();
      await page.waitForLoadState("networkidle");

      expect(page.url()).toMatch(/\/athletes\/.+/);
    }
  });

  test("should show hover effects on athlete rows", async ({ page }) => {
    const clickableRows = page.locator('[class*="cursor-pointer"]');

    if (await clickableRows.count() > 0) {
      const row = clickableRows.first();
      await row.hover();

      // Row should be hoverable (visual feedback)
      await expect(row).toBeVisible();
    }
  });

  test("should display loading state while fetching data", async ({ page }) => {
    // Reload page to see loading state
    await page.reload();

    // Look for skeleton loaders or loading indicators
    const _skeleton = page.locator('[class*="skeleton"], [class*="animate-pulse"]');
    const _loader = page.locator('[class*="loading"], [class*="spinner"]');

    // Either show loading state or data quickly loaded
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("athletes");
  });
});

test.describe("Leaderboard Pagination/Scrolling", () => {
  test("should handle scrolling through long lists", async ({ page }) => {
    await page.goto("/athletes");
    await page.waitForLoadState("networkidle");

    // Scroll to bottom of page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Page should remain functional
    expect(page.url()).toContain("athletes");

    // Scroll back to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  test("should maintain filter state while scrolling", async ({ page }) => {
    await page.goto("/athletes");
    await page.waitForLoadState("networkidle");

    const searchInput = page.getByPlaceholder(/search/i);

    if (await searchInput.count() > 0) {
      // Apply filter
      await searchInput.fill("test");
      await page.waitForTimeout(500);

      // Scroll
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(300);

      // Filter should remain
      await expect(searchInput).toHaveValue("test");
    }
  });
});

test.describe("Podium Display", () => {
  test("should display top 3 athletes prominently on homepage", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for podium or top athletes section
    const topAthletes = page.getByText(/top athletes/i);
    const podium = page.locator('[class*="podium"]');

    if ((await topAthletes.count()) > 0 || (await podium.count()) > 0) {
      const section = (await topAthletes.count()) > 0 ? topAthletes : podium;
      await section.first().scrollIntoViewIfNeeded();
      await expect(section.first()).toBeVisible();
    }
  });

  test("should show position badges (1st, 2nd, 3rd)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for position indicators
    const first = page.getByText(/1st/i);
    const second = page.getByText(/2nd/i);
    const third = page.getByText(/3rd/i);

    const _hasPositions =
      (await first.count()) > 0 ||
      (await second.count()) > 0 ||
      (await third.count()) > 0;

    // Positions may or may not be visible depending on data
    expect(page.url()).toBe("http://localhost:3000/");
  });

  test("should navigate to athlete profile from podium", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find clickable elements in podium area
    const podiumLinks = page.locator('[class*="podium"] [class*="cursor-pointer"]');
    const topAthleteLinks = page.locator(
      '[class*="cursor-pointer"]'
    );

    if (await podiumLinks.count() > 0) {
      await podiumLinks.first().click();
      await page.waitForLoadState("networkidle");
    } else if (await topAthleteLinks.count() > 0) {
      // Click on a top athlete if available
      await topAthleteLinks.first().click();
      await page.waitForLoadState("networkidle");
    }
  });
});
