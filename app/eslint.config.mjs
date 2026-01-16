import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Enhanced ESLint configuration for Longevity World Cup
 * Includes stricter rules for code quality, consistency, and best practices
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Additional ignores
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
  ]),

  // Custom strict rules for code quality
  {
    rules: {
      // TypeScript strict rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",

      // React best practices
      "react/jsx-no-leaked-render": ["warn", { validStrategies: ["ternary", "coerce"] }],
      "react/jsx-curly-brace-presence": ["warn", { props: "never", children: "never" }],
      "react/self-closing-comp": ["warn", { component: true, html: true }],
      "react/jsx-boolean-value": ["warn", "never"],

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // General code quality
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "no-unused-expressions": "error",
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always", { null: "ignore" }],
      "curly": ["warn", "multi-line"],
      "no-nested-ternary": "warn",

      // Import organization
      "import/first": "error",
      "import/no-duplicates": "error",
      "import/newline-after-import": "warn",

      // Accessibility
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",

      // Next.js specific
      "@next/next/no-img-element": "warn",
    },
  },

  // Test files - relaxed rules
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/test/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  // E2E test files - more relaxed
  {
    files: ["e2e/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-unused-expressions": "off",
    },
  },
]);

export default eslintConfig;
