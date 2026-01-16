# Testing Documentation

## Longevity World Cup - E2E Testing Guide

This document outlines the testing strategy, setup, and execution for the Longevity World Cup platform.

---

## Testing Stack

| Tool | Purpose | Version |
|------|---------|---------|
| Playwright | End-to-end browser testing | Latest |
| Vitest | Unit testing (future) | - |
| SQLite | Test database | - |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Development server running (or let Playwright start it)

### Running Tests

```bash
# Navigate to app directory
cd app

# Run all E2E tests
npx playwright test

# Run tests with UI mode (interactive)
npx playwright test --ui

# Run tests in headed mode (see the browser)
npx playwright test --headed

# Run specific test file
npx playwright test e2e/homepage.spec.ts

# Run tests with verbose output
npx playwright test --reporter=list
```

---

## Test Structure

```
app/
├── e2e/                          # E2E test files
│   ├── homepage.spec.ts          # Homepage tests
│   ├── athletes.spec.ts          # Athletes page tests
│   ├── about.spec.ts             # About page tests
│   └── rules.spec.ts             # Rules page tests
├── playwright.config.ts          # Playwright configuration
└── test-results/                 # Generated test artifacts
```

---

## Test Coverage

### Homepage (`homepage.spec.ts`)

| Test | Description | Status |
|------|-------------|--------|
| Display hero section | Verifies h1 heading and CTA buttons | ✅ |
| Display statistics section | Checks Athletes, Season, Prize Pool stats | ✅ |
| Display prize pool section | Verifies prize pool heading and donate button | ✅ |
| Display leaderboard section | Checks leaderboard loads with view all button | ✅ |
| Navigate to about page | Tests Learn More button navigation | ✅ |
| Responsive layout | Tests mobile, tablet, and desktop viewports | ✅ |

### Athletes Page (`athletes.spec.ts`)

| Test | Description | Status |
|------|-------------|--------|
| Display page heading | Verifies "Athletes" heading and subtitle | ✅ |
| Display search controls | Checks search input and Apply button | ✅ |
| Load athlete cards | Verifies athlete cards with Verified badges | ✅ |
| Filter by search | Tests search functionality | ✅ |
| Filter by division | Tests division dropdown filter | ✅ |
| Navigate to profile | Tests clicking athlete card navigates to profile | ✅ |
| Display athlete statistics | Checks Age, Reduction, Rank stats | ✅ |
| Show verified badge | Verifies Verified badge visibility | ✅ |

### About Page (`about.spec.ts`)

| Test | Description | Status |
|------|-------------|--------|
| Display page heading | Verifies About heading and LWC text | ✅ |
| Display mission section | Checks Our Mission heading | ✅ |
| Display how it works | Verifies feature cards (4 features) | ✅ |
| Display PhenoAge section | Checks PhenoAge explanation and biomarkers | ✅ |
| Display competition categories | Verifies division and generation info | ✅ |
| CTA buttons | Checks Join Competition and Read Rules buttons | ✅ |
| Navigate to rules | Tests Read the Rules navigation | ✅ |
| Navigate to onboarding | Tests Join Competition navigation | ✅ |

### Rules Page (`rules.spec.ts`)

| Test | Description | Status |
|------|-------------|--------|
| Display page heading | Verifies "Competition Rules" heading | ✅ |
| Display quick summary | Checks 3-step summary section | ✅ |
| Display detailed rules | Verifies 6 rule section headings | ✅ |
| Display biomarkers table | Checks table headers and data | ✅ |
| Display prize distribution | Verifies 1st, 2nd, 3rd place percentages | ✅ |
| Display dispute resolution | Checks organizing committee info | ✅ |
| CTA buttons | Verifies Join and View Athletes buttons | ✅ |
| Navigate to athletes | Tests View Athletes navigation | ✅ |

---

## Configuration

### playwright.config.ts

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      DATABASE_URL: "file:/home/cancelei/Projects/longevity-world-cup-rebuild/app/prisma/dev.db",
    },
  },
});
```

---

## Database Setup for Testing

Tests use a SQLite database for local development. Before running tests:

```bash
# Ensure database is set up
cd app

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database (optional, for realistic data)
npx prisma db seed
```

### Environment Variables

Create `.env.local` in the app directory:

```env
DATABASE_URL="file:/absolute/path/to/app/prisma/dev.db"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

---

## Writing New Tests

### Test Template

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/route");
  });

  test("should do something", async ({ page }) => {
    // Arrange - navigate or set up state

    // Act - perform user actions
    await page.getByRole("button", { name: /click me/i }).click();

    // Assert - verify expected outcomes
    await expect(page.getByText("Success")).toBeVisible();
  });
});
```

### Best Practices

1. **Use Semantic Locators**: Prefer `getByRole`, `getByLabel`, `getByText` over CSS selectors
2. **Handle Multiple Elements**: Use `.first()` when multiple elements match
3. **Wait for Data**: Use `waitForTimeout` or `waitForSelector` for async data
4. **Avoid Flakiness**: Add appropriate timeouts for dynamic content
5. **Test User Flows**: Focus on critical user journeys

### Common Patterns

```typescript
// Wait for API data to load
await page.waitForTimeout(2000);

// Handle multiple matching elements
await expect(page.getByText("Athletes").first()).toBeVisible();

// Use exact matching when needed
await expect(page.getByRole("main").getByText("Title", { exact: true })).toBeVisible();

// Navigate and verify URL
await page.getByRole("button", { name: /view/i }).click();
await expect(page).toHaveURL(/\/expected-route/);
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: |
          cd app
          npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps chromium

      - name: Setup Database
        run: |
          cd app
          npx prisma generate
          npx prisma migrate dev
          npx prisma db seed

      - name: Run E2E Tests
        run: |
          cd app
          npx playwright test

      - name: Upload Test Artifacts
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: app/playwright-report/
```

---

## Debugging Tests

### View Failed Screenshots
```bash
# Open HTML report
npx playwright show-report
```

### Run in Debug Mode
```bash
# Debug mode with Playwright Inspector
npx playwright test --debug

# Debug specific test
npx playwright test --debug e2e/homepage.spec.ts
```

### Trace Viewer
```bash
# Generate traces on failure
npx playwright test --trace on

# View traces
npx playwright show-trace test-results/trace.zip
```

---

## Test Results Summary

| Suite | Tests | Passed | Status |
|-------|-------|--------|--------|
| Homepage | 6 | 6 | ✅ |
| Athletes | 8 | 8 | ✅ |
| About | 8 | 8 | ✅ |
| Rules | 8 | 8 | ✅ |
| **Total** | **30** | **30** | **✅ 100%** |

---

## Troubleshooting

### Common Issues

1. **Port 3000 Already in Use**
   ```bash
   # Kill existing processes
   fuser -k 3000/tcp
   ```

2. **Database Not Found**
   - Ensure `DATABASE_URL` uses absolute path
   - Run `npx prisma generate` and `npx prisma migrate dev`

3. **Timeout Errors**
   - Increase `waitForTimeout` for slow-loading data
   - Check if dev server is running

4. **Element Not Found**
   - Use Playwright Inspector to find correct locators
   - Check if element is inside shadow DOM

---

*Last Updated: January 7, 2026*
