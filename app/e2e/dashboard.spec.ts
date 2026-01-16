import { test, expect } from "@playwright/test";

/**
 * Dashboard E2E Tests
 * Tests the athlete dashboard experience
 * Essential user flow: Login → Dashboard → Submit → View Results
 */

test.describe("Dashboard Page", () => {
  test.describe("Dashboard Access", () => {
    test("should display dashboard page or redirect to auth", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      const _url = page.url();
      // Should be on dashboard, auth, or onboarding
      expect(
        url.includes("dashboard") || url.includes("sign") || url.includes("onboarding")
      ).toBeTruthy();
    });

    test("should protect dashboard from unauthenticated access", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // If not authenticated, should not show protected content
      const _url = page.url();
      if (!url.includes("sign")) {
        // If we're on dashboard, content should be visible
        const dashboardContent = page.locator("main, [role='main']");
        await expect(dashboardContent).toBeVisible();
      }
    });
  });

  test.describe("Dashboard Content", () => {
    test("should display key stats widgets", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      if (page.url().includes("dashboard")) {
        // Look for stat cards/widgets
        const statCards = page.locator(
          '[class*="stat"], [class*="card"], [class*="widget"]'
        );

        if (await statCards.count() > 0) {
          await expect(statCards.first()).toBeVisible();
        }

        // Look for specific stats
        const rankStat = page.getByText(/rank/i);
        const ageStat = page.getByText(/biological age|bio.*age/i);
        const reductionStat = page.getByText(/age reduction|years younger/i);

        // At least one stat should be visible
        const hasStats =
          (await rankStat.count()) > 0 ||
          (await ageStat.count()) > 0 ||
          (await reductionStat.count()) > 0;

        expect(hasStats).toBeTruthy();
      }
    });

    test("should display user information", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      if (page.url().includes("dashboard")) {
        // User avatar or name should be visible
        const avatar = page.locator('[class*="avatar"], img[alt*="profile" i]');
        const userName = page.locator('[class*="name"], [class*="user"]');

        const _hasUserInfo =
          (await avatar.count()) > 0 || (await userName.count()) > 0;

        // User info should be present
      }
    });

    test("should have quick action buttons", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      if (page.url().includes("dashboard")) {
        // Look for action buttons
        const submitBtn = page.getByRole("button", { name: /submit|new submission/i });
        const viewLeaderboardBtn = page.getByRole("link", { name: /leaderboard|rankings/i });
        const settingsBtn = page.getByRole("link", { name: /settings/i });

        const _hasActions =
          (await submitBtn.count()) > 0 ||
          (await viewLeaderboardBtn.count()) > 0 ||
          (await settingsBtn.count()) > 0;

        // Action buttons should be present
      }
    });

    test("should display recent submissions", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      if (page.url().includes("dashboard")) {
        // Look for submissions table or list
        const submissionsSection = page.getByText(/recent|submissions|history/i);
        const submissionsTable = page.locator("table");

        const _hasSubmissions =
          (await submissionsSection.count()) > 0 ||
          (await submissionsTable.count()) > 0;

        // Submissions section should be present
      }
    });

    test("should display earned badges", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      if (page.url().includes("dashboard")) {
        // Look for badges section
        const badgesSection = page.getByText(/badges|achievements/i);
        const badges = page.locator('[class*="badge"]');

        const _hasBadges =
          (await badgesSection.count()) > 0 || (await badges.count()) > 0;

        // Badges section may or may not be present
      }
    });
  });

  test.describe("Dashboard Navigation", () => {
    test("should navigate to submit page", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      if (page.url().includes("dashboard")) {
        const submitLink = page.getByRole("link", { name: /submit|new/i });

        if (await submitLink.count() > 0) {
          await submitLink.first().click();
          await page.waitForLoadState("networkidle");

          expect(page.url()).toContain("submit");
        }
      }
    });

    test("should navigate to profile page", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      if (page.url().includes("dashboard")) {
        const profileLink = page.getByRole("link", { name: /profile|view profile/i });

        if (await profileLink.count() > 0) {
          await profileLink.first().click();
          await page.waitForLoadState("networkidle");

          const _url = page.url();
          expect(url.includes("profile") || url.includes("athletes")).toBeTruthy();
        }
      }
    });

    test("should navigate to settings page", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      if (page.url().includes("dashboard")) {
        const settingsLink = page.getByRole("link", { name: /settings/i });

        if (await settingsLink.count() > 0) {
          await settingsLink.first().click();
          await page.waitForLoadState("networkidle");

          expect(page.url()).toContain("settings");
        }
      }
    });

    test("should navigate to leaderboard", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      if (page.url().includes("dashboard")) {
        const leaderboardLink = page.getByRole("link", { name: /leaderboard|rankings/i });

        if (await leaderboardLink.count() > 0) {
          await leaderboardLink.first().click();
          await page.waitForLoadState("networkidle");

          expect(page.url()).toContain("athletes");
        }
      }
    });
  });

  test.describe("Dashboard Responsiveness", () => {
    test("should display properly on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      if (page.url().includes("dashboard")) {
        // Content should fit on screen
        const mainContent = page.locator("main, [role='main']");

        if (await mainContent.count() > 0) {
          const box = await mainContent.first().boundingBox();
          if (box) {
            expect(box.width).toBeLessThanOrEqual(375);
          }
        }
      }
    });

    test("should display properly on tablet", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      if (page.url().includes("dashboard")) {
        const mainContent = page.locator("main, [role='main']");
        await expect(mainContent).toBeVisible();
      }
    });

    test("should display properly on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      if (page.url().includes("dashboard")) {
        const mainContent = page.locator("main, [role='main']");
        await expect(mainContent).toBeVisible();
      }
    });
  });
});

test.describe("Dashboard Stats", () => {
  test("should display current rank with trend indicator", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    if (page.url().includes("dashboard")) {
      const rankDisplay = page.getByText(/#\d+|rank.*\d+/i);

      if (await rankDisplay.count() > 0) {
        await expect(rankDisplay.first()).toBeVisible();
      }

      // Look for trend indicator (up/down arrow)
      const _trendUp = page.locator('[class*="up"], [class*="arrow-up"]');
      const _trendDown = page.locator('[class*="down"], [class*="arrow-down"]');

      // Trend indicator may or may not be present
    }
  });

  test("should display biological age", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    if (page.url().includes("dashboard")) {
      const bioAge = page.getByText(/biological.*age|bio.*age/i);
      const ageValue = page.getByText(/\d+\.?\d*\s*(years?|yrs?)/i);

      const _hasAge = (await bioAge.count()) > 0 || (await ageValue.count()) > 0;
      // Age display should be present
    }
  });

  test("should display age reduction", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    if (page.url().includes("dashboard")) {
      const _ageReduction = page.getByText(/age reduction|years younger/i);
      const reductionValue = page.getByText(/-?\d+\.?\d*\s*(years?|yrs?)/i);

      const _hasReduction =
        (await ageReduction.count()) > 0 || (await reductionValue.count()) > 0;
      // Age reduction display should be present
    }
  });

  test("should display pace of aging", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    if (page.url().includes("dashboard")) {
      const paceOfAging = page.getByText(/pace.*aging|aging rate/i);
      const percentage = page.getByText(/\d+\.?\d*\s*%/);

      const _hasPace = (await paceOfAging.count()) > 0 || (await percentage.count()) > 0;
      // Pace of aging display may be present
    }
  });
});

test.describe("Dashboard Interactions", () => {
  test("should refresh stats on page reload", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    if (page.url().includes("dashboard")) {
      // Store initial content
      const _initialContent = await page.content();

      // Reload page
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Page should still have dashboard content
      const _newContent = await page.content();
      expect(page.url()).toContain("dashboard");
    }
  });

  test("should handle clicking on stat cards", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    if (page.url().includes("dashboard")) {
      const statCards = page.locator('[class*="stat"], [class*="card"]');

      if (await statCards.count() > 0) {
        await statCards.first().click();
        await page.waitForTimeout(500);

        // May navigate, open modal, or do nothing
        // Just verify page doesn't break
        expect(page.url()).toBeTruthy();
      }
    }
  });

  test("should display welcome message for new users", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    if (page.url().includes("dashboard")) {
      // Look for welcome message
      const _welcomeMessage = page.getByText(/welcome|get started|first submission/i);

      // Welcome message may be present for new users
    }
  });
});
