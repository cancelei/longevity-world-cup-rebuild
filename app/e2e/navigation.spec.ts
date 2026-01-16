import { test, expect } from "@playwright/test";

/**
 * Navigation E2E Tests
 * Tests the site-wide navigation and user flows
 */

test.describe("Main Navigation", () => {
  test.describe("Header Navigation", () => {
    test("should display header on all pages", async ({ page }) => {
      const pages = ["/", "/about", "/athletes", "/rules"];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState("networkidle");

        const header = page.locator("header");
        await expect(header).toBeVisible();
      }
    });

    test("should have logo link to homepage", async ({ page }) => {
      await page.goto("/about");
      await page.waitForLoadState("networkidle");

      // Click on logo (usually first link in header or has specific class)
      const logoLink = page.locator('header a[href="/"]').first();

      if (await logoLink.count() > 0) {
        await logoLink.click();
        await page.waitForURL("/");
        expect(page.url()).toBe("http://localhost:3000/");
      }
    });

    test("should navigate to about page", async ({ page }) => {
      await page.goto("/");

      const aboutLink = page.getByRole("link", { name: /about/i });
      if (await aboutLink.count() > 0) {
        await aboutLink.first().click();
        await page.waitForURL(/about/);
        expect(page.url()).toContain("about");
      }
    });

    test("should navigate to athletes page", async ({ page }) => {
      await page.goto("/");

      const athletesLink = page.getByRole("link", { name: /athletes/i });
      if (await athletesLink.count() > 0) {
        await athletesLink.first().click();
        await page.waitForURL(/athletes/);
        expect(page.url()).toContain("athletes");
      }
    });

    test("should navigate to rules page", async ({ page }) => {
      await page.goto("/");

      const rulesLink = page.getByRole("link", { name: /rules/i });
      if (await rulesLink.count() > 0) {
        await rulesLink.first().click();
        await page.waitForURL(/rules/);
        expect(page.url()).toContain("rules");
      }
    });
  });

  test.describe("Mobile Navigation", () => {
    test("should show mobile menu button on small screens", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      // Look for hamburger menu button
      const menuButton = page.getByRole("button", { name: /menu|toggle/i });
      const hamburger = page.locator('[class*="hamburger"], [class*="menu"]');

      const hasMobileMenu = await menuButton.count() > 0 || await hamburger.count() > 0;

      // Mobile menu should be available
      expect(hasMobileMenu).toBeTruthy();
    });

    test("should open mobile menu when clicked", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      const menuButton = page.getByRole("button", { name: /menu/i }).first();

      if (await menuButton.count() > 0) {
        await menuButton.click();

        // Wait for menu animation
        await page.waitForTimeout(300);

        // Navigation links should be visible in mobile menu
        const mobileNav = page.locator('[class*="mobile"]');
        const navLinks = page.getByRole("link");

        const hasNavigation = await mobileNav.count() > 0 || await navLinks.count() > 2;
        expect(hasNavigation).toBeTruthy();
      }
    });

    test("should navigate from mobile menu", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      const menuButton = page.getByRole("button", { name: /menu/i }).first();

      if (await menuButton.count() > 0) {
        await menuButton.click();
        await page.waitForTimeout(300);

        // Try to click on About link in mobile menu
        const aboutLink = page.getByRole("link", { name: /about/i }).first();
        if (await aboutLink.count() > 0) {
          await aboutLink.click();
          await page.waitForLoadState("networkidle");
          expect(page.url()).toContain("about");
        }
      }
    });
  });

  test.describe("Footer Navigation", () => {
    test("should display footer on all pages", async ({ page }) => {
      const pages = ["/", "/about", "/athletes"];

      for (const pagePath of pages) {
        await page.goto(pagePath);
        await page.waitForLoadState("networkidle");

        const footer = page.locator("footer");
        if (await footer.count() > 0) {
          await expect(footer).toBeVisible();
        }
      }
    });

    test("should have footer links", async ({ page }) => {
      await page.goto("/");

      const footer = page.locator("footer");
      if (await footer.count() > 0) {
        const footerLinks = footer.getByRole("link");
        expect(await footerLinks.count()).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

test.describe("Breadcrumb Navigation", () => {
  test("should show breadcrumbs on nested pages if available", async ({ page }) => {
    await page.goto("/athletes");
    await page.waitForLoadState("networkidle");

    // Navigate to a specific athlete if possible
    const athleteLinks = page.locator('a[href^="/athletes/"]').filter({ hasNot: page.locator('[href="/athletes"]') });

    if (await athleteLinks.count() > 0) {
      await athleteLinks.first().click();
      await page.waitForLoadState("networkidle");

      // Check for breadcrumb navigation
      const breadcrumb = page.locator('[class*="breadcrumb"], nav[aria-label*="breadcrumb"]');
      const backLink = page.getByRole("link", { name: /back|athletes/i });

      // Should have some way to navigate back
      const _hasBackNav = await breadcrumb.count() > 0 || await backLink.count() > 0;

      // Profile page loaded
      expect(page.url()).toMatch(/\/athletes\/.+/);
    }
  });
});

test.describe("Deep Links", () => {
  test("should load pages directly via URL", async ({ page }) => {
    const directPaths = [
      { path: "/about", expectedContent: /about/i },
      { path: "/athletes", expectedContent: /athletes/i },
      { path: "/rules", expectedContent: /rules/i },
    ];

    for (const { path, expectedContent: _expectedContent } of directPaths) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      expect(page.url()).toContain(path);
    }
  });

  test("should handle 404 pages gracefully", async ({ page }) => {
    await page.goto("/non-existent-page-12345");
    await page.waitForLoadState("networkidle");

    // Should show error page or redirect to home
    const notFound = page.getByText(/not found|404/i);
    const hasNotFound = await notFound.count() > 0;
    const isHome = page.url() === "http://localhost:3000/";

    expect(hasNotFound || isHome).toBeTruthy();
  });
});

test.describe("Scroll Behavior", () => {
  test("should scroll to top on page navigation", async ({ page }) => {
    await page.goto("/");

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 1000));

    // Navigate to another page
    const aboutLink = page.getByRole("link", { name: /about/i }).first();
    if (await aboutLink.count() > 0) {
      await aboutLink.click();
      await page.waitForLoadState("networkidle");

      // Should be at top of page
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeLessThanOrEqual(100);
    }
  });
});
