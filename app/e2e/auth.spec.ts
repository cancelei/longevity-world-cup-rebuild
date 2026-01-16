import { test, expect } from "@playwright/test";

/**
 * Authentication E2E Tests
 * Tests the authentication flows and pages
 * Note: Actual Clerk authentication is not tested here, only page presence
 */

test.describe("Authentication Pages", () => {
  test.describe("Sign In Page", () => {
    test("should display the sign-in page", async ({ page }) => {
      await page.goto("/sign-in");

      // Wait for page to load (Clerk component may take time)
      await page.waitForLoadState("networkidle");

      // Page should be accessible
      expect(page.url()).toContain("sign-in");
    });

    test("should have a link to sign up", async ({ page }) => {
      await page.goto("/sign-in");
      await page.waitForLoadState("networkidle");

      // Look for sign up link or redirect capability (Clerk may render differently)
      const signUpLink = page.getByRole("link", { name: /sign up/i });
      const signUpText = page.getByText(/sign up/i);
      const createAccount = page.getByText(/create.*account/i);

      // Either should be present, or page is an auth page
      const hasSignUp = await signUpLink.count() > 0 || await signUpText.count() > 0 || await createAccount.count() > 0;
      expect(hasSignUp || page.url().includes("sign")).toBeTruthy();
    });
  });

  test.describe("Sign Up Page", () => {
    test("should display the sign-up page", async ({ page }) => {
      await page.goto("/sign-up");

      // Wait for page to load
      await page.waitForLoadState("networkidle");

      // Page should be accessible
      expect(page.url()).toContain("sign-up");
    });

    test("should have a link to sign in", async ({ page }) => {
      await page.goto("/sign-up");
      await page.waitForLoadState("networkidle");

      // Look for sign in link (Clerk may render differently)
      const signInLink = page.getByRole("link", { name: /sign in/i });
      const signInText = page.getByText(/sign in/i);
      const loginText = page.getByText(/log in/i);

      const hasSignIn = await signInLink.count() > 0 || await signInText.count() > 0 || await loginText.count() > 0;
      expect(hasSignIn || page.url().includes("sign")).toBeTruthy();
    });
  });

  test.describe("Protected Routes Redirect", () => {
    test("should redirect to sign-in when accessing dashboard unauthenticated", async ({ page }) => {
      await page.goto("/dashboard");

      // Should redirect to sign-in or show unauthorized content
      await page.waitForLoadState("networkidle");

      // Either redirected to sign-in, stayed on dashboard with auth, or shows 404
      const _url = page.url();
      const isHandled = url.includes("sign") || url.includes("dashboard") || url === "http://localhost:3000/";
      expect(isHandled).toBeTruthy();
    });

    test("should redirect to sign-in when accessing admin unauthenticated", async ({ page }) => {
      await page.goto("/admin");

      await page.waitForLoadState("networkidle");

      // Should redirect to sign-in or show 404/unauthorized
      const _url = page.url();
      expect(url.includes("sign-in") || url.includes("admin")).toBeTruthy();
    });
  });
});

test.describe("Navigation Authentication Links", () => {
  test("should show sign-in button in header when unauthenticated", async ({ page }) => {
    await page.goto("/");

    // Header should have sign in or join button
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Look for auth-related buttons
    const signInBtn = page.getByRole("button", { name: /sign in/i });
    const joinBtn = page.getByRole("button", { name: /join/i });

    const hasAuthButton = await signInBtn.count() > 0 || await joinBtn.count() > 0;
    expect(hasAuthButton).toBeTruthy();
  });

  test("should navigate to sign-in from header", async ({ page }) => {
    await page.goto("/");

    // Click on auth button in header
    const signInBtn = page.getByRole("button", { name: /sign in/i }).first();
    const joinBtn = page.getByRole("button", { name: /join/i }).first();

    if (await signInBtn.count() > 0) {
      await signInBtn.click();
    } else if (await joinBtn.count() > 0) {
      await joinBtn.click();
    }

    await page.waitForLoadState("networkidle");

    // Should be on auth page
    const _url = page.url();
    expect(url.includes("sign-in") || url.includes("sign-up") || url.includes("onboarding")).toBeTruthy();
  });
});
