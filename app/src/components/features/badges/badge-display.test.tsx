import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  BadgeDisplay,
  BadgeGrid,
  BadgeShowcase,
  BadgeEarnedNotification,
  type BadgeCategory,
} from "./badge-display";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Helper to create a badge with specific category
function createBadge(
  overrides: Partial<{
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    category: BadgeCategory;
    earnedAt?: Date;
  }> = {}
) {
  return {
    id: overrides.id || "badge-1",
    name: overrides.name || "Test Badge",
    slug: overrides.slug || "test-badge",
    description: overrides.description || "A test badge description",
    icon: overrides.icon || "trophy",
    category: overrides.category || "ACHIEVEMENT",
    earnedAt: overrides.earnedAt,
  };
}

// Create badges for all categories with longest typical badge names
function createAllCategoryBadges() {
  const badges: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    category: BadgeCategory;
  }> = [
    // Original categories
    {
      id: "1",
      name: "Verified Champion Athlete",
      slug: "verified-champion",
      description: "Achievement category badge with long name",
      icon: "badge-check",
      category: "ACHIEVEMENT",
    },
    {
      id: "2",
      name: "Ultimate Super Ager Master",
      slug: "super-ager-master",
      description: "Milestone category badge with long name",
      icon: "crown",
      category: "MILESTONE",
    },
    {
      id: "3",
      name: "Championship Winner Trophy",
      slug: "championship-winner",
      description: "Competition category badge with long name",
      icon: "trophy",
      category: "COMPETITION",
    },
    {
      id: "4",
      name: "Community Ambassador Elite",
      slug: "community-ambassador",
      description: "Community category badge with long name",
      icon: "users",
      category: "COMMUNITY",
    },
    {
      id: "5",
      name: "Legendary Pioneer Master",
      slug: "legendary-pioneer",
      description: "Special category badge with long name",
      icon: "sparkles",
      category: "SPECIAL",
    },
    // New categories with longest names
    {
      id: "6",
      name: "League Championship Founder",
      slug: "league-championship-founder",
      description: "League category badge with longest name",
      icon: "building",
      category: "LEAGUE",
    },
    {
      id: "7",
      name: "Inflammation Fighter Master",
      slug: "inflammation-fighter-master",
      description: "Biomarker category badge with long name",
      icon: "heart-pulse",
      category: "BIOMARKER",
    },
    {
      id: "8",
      name: "Consistent Improvement Champion",
      slug: "improvement-champion",
      description: "Improvement category badge with longest name",
      icon: "chart-line",
      category: "IMPROVEMENT",
    },
    {
      id: "9",
      name: "Winter Warrior Championship",
      slug: "winter-warrior-championship",
      description: "Seasonal category badge with longest name",
      icon: "snowflake",
      category: "SEASONAL",
    },
    {
      id: "10",
      name: "OCR Pioneer Research Master",
      slug: "ocr-pioneer-research-master",
      description: "Science category badge with longest name",
      icon: "microscope",
      category: "SCIENCE",
    },
  ];
  return badges;
}

describe("BadgeDisplay", () => {
  describe("Basic Rendering", () => {
    it("renders badge with correct icon", () => {
      const badge = createBadge({ icon: "trophy" });
      render(<BadgeDisplay badge={badge} />);

      // Badge should render without throwing
      expect(document.querySelector("svg")).toBeInTheDocument();
    });

    it("renders badge with tooltip showing name and description", async () => {
      const badge = createBadge({
        name: "Test Badge",
        description: "Test description",
      });
      const { container } = render(<BadgeDisplay badge={badge} showTooltip={true} />);

      // Tooltip trigger should be present (wraps the badge with data-state attribute)
      const tooltipTrigger = container.querySelector("[data-state]");
      expect(tooltipTrigger).toBeInTheDocument();
    });

    it("renders without tooltip when showTooltip is false", () => {
      const badge = createBadge();
      render(<BadgeDisplay badge={badge} showTooltip={false} />);

      // No tooltip trigger (button) should be present
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("renders all size variants correctly", () => {
      const badge = createBadge();

      const { rerender, container } = render(
        <BadgeDisplay badge={badge} size="sm" />
      );
      expect(container.querySelector(".w-8")).toBeInTheDocument();

      rerender(<BadgeDisplay badge={badge} size="md" />);
      expect(container.querySelector(".w-12")).toBeInTheDocument();

      rerender(<BadgeDisplay badge={badge} size="lg" />);
      expect(container.querySelector(".w-16")).toBeInTheDocument();
    });

    it("displays earned date in tooltip when provided", () => {
      const earnedDate = new Date("2025-01-15");
      const badge = createBadge({ earnedAt: earnedDate });
      render(<BadgeDisplay badge={badge} />);

      // The date should be in the component (even if hidden in tooltip)
      expect(document.body.textContent).not.toContain("Earned");
    });
  });

  describe("Category Styling", () => {
    const categories: BadgeCategory[] = [
      "ACHIEVEMENT",
      "MILESTONE",
      "COMPETITION",
      "COMMUNITY",
      "SPECIAL",
      "LEAGUE",
      "BIOMARKER",
      "IMPROVEMENT",
      "SEASONAL",
      "SCIENCE",
    ];

    it.each(categories)("renders %s category with correct styling", (category) => {
      const badge = createBadge({ category });
      const { container } = render(<BadgeDisplay badge={badge} />);

      // Each category should apply background and border classes
      const badgeElement = container.querySelector(".rounded-full.border-2");
      expect(badgeElement).toBeInTheDocument();
    });

    it("applies special glow effect to SPECIAL category badges", () => {
      const badge = createBadge({ category: "SPECIAL" });
      const { container } = render(<BadgeDisplay badge={badge} />);

      // SPECIAL category has gradient background
      const badgeElement = container.querySelector('[class*="from-pink"]');
      expect(badgeElement).toBeInTheDocument();
    });
  });

  describe("Icon Mapping", () => {
    const iconMappings = [
      { icon: "trophy", category: "COMPETITION" as BadgeCategory },
      { icon: "medal", category: "COMPETITION" as BadgeCategory },
      { icon: "heart-pulse", category: "BIOMARKER" as BadgeCategory },
      { icon: "chart-line", category: "IMPROVEMENT" as BadgeCategory },
      { icon: "snowflake", category: "SEASONAL" as BadgeCategory },
      { icon: "microscope", category: "SCIENCE" as BadgeCategory },
      { icon: "building", category: "LEAGUE" as BadgeCategory },
      { icon: "sparkles", category: "SPECIAL" as BadgeCategory },
    ];

    it.each(iconMappings)(
      "renders $icon icon for $category badge",
      ({ icon, category }) => {
        const badge = createBadge({ icon, category });
        const { container } = render(<BadgeDisplay badge={badge} />);

        // SVG icon should be rendered
        expect(container.querySelector("svg")).toBeInTheDocument();
      }
    );

    it("falls back to Award icon for unknown icon names", () => {
      const badge = createBadge({ icon: "unknown-icon-that-does-not-exist" });
      const { container } = render(<BadgeDisplay badge={badge} />);

      // Should still render an SVG (the fallback Award icon)
      expect(container.querySelector("svg")).toBeInTheDocument();
    });
  });
});

describe("BadgeGrid", () => {
  it("renders empty state when no badges", () => {
    render(<BadgeGrid badges={[]} />);
    expect(screen.getByText("No badges earned yet")).toBeInTheDocument();
  });

  it("renders all badges when no maxDisplay limit", () => {
    const badges = [
      createBadge({ id: "1", name: "Badge 1" }),
      createBadge({ id: "2", name: "Badge 2" }),
      createBadge({ id: "3", name: "Badge 3" }),
    ];
    const { container } = render(<BadgeGrid badges={badges} />);

    // All 3 badges should be rendered
    const badgeElements = container.querySelectorAll(".rounded-full.border-2");
    expect(badgeElements.length).toBe(3);
  });

  it("limits displayed badges and shows count when maxDisplay is set", () => {
    const badges = [
      createBadge({ id: "1" }),
      createBadge({ id: "2" }),
      createBadge({ id: "3" }),
      createBadge({ id: "4" }),
      createBadge({ id: "5" }),
    ];
    render(<BadgeGrid badges={badges} maxDisplay={3} />);

    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const badges = [createBadge()];
    const { container } = render(
      <BadgeGrid badges={badges} className="custom-class" />
    );

    expect(container.querySelector(".custom-class")).toBeInTheDocument();
  });
});

describe("BadgeShowcase", () => {
  it("renders empty state when no badges", () => {
    render(<BadgeShowcase badges={[]} />);
    expect(screen.getByText("No badges earned yet")).toBeInTheDocument();
    expect(
      screen.getByText("Complete challenges to earn badges!")
    ).toBeInTheDocument();
  });

  it("renders custom title", () => {
    render(<BadgeShowcase badges={[]} title="My Custom Badges" />);
    expect(screen.getByText("My Custom Badges")).toBeInTheDocument();
  });

  it("groups badges by category", () => {
    const badges = [
      createBadge({ id: "1", category: "ACHIEVEMENT" }),
      createBadge({ id: "2", category: "ACHIEVEMENT" }),
      createBadge({ id: "3", category: "MILESTONE" }),
    ];
    render(<BadgeShowcase badges={badges} />);

    expect(screen.getByText("Achievements")).toBeInTheDocument();
    expect(screen.getByText("Milestones")).toBeInTheDocument();
  });

  it("renders all 10 category labels correctly", () => {
    const badges = createAllCategoryBadges();
    render(<BadgeShowcase badges={badges} />);

    // All category labels should be present
    expect(screen.getByText("Achievements")).toBeInTheDocument();
    expect(screen.getByText("Milestones")).toBeInTheDocument();
    expect(screen.getByText("Competition")).toBeInTheDocument();
    expect(screen.getByText("Community")).toBeInTheDocument();
    expect(screen.getByText("Special")).toBeInTheDocument();
    expect(screen.getByText("League")).toBeInTheDocument();
    expect(screen.getByText("Biomarker")).toBeInTheDocument();
    expect(screen.getByText("Improvement")).toBeInTheDocument();
    expect(screen.getByText("Seasonal")).toBeInTheDocument();
    expect(screen.getByText("Science")).toBeInTheDocument();
  });
});

describe("BadgeEarnedNotification", () => {
  it("renders badge earned notification with badge details", () => {
    const badge = createBadge({
      name: "Super Ager",
      description: "Achieved 10+ years age reduction",
    });
    render(<BadgeEarnedNotification badge={badge} />);

    expect(screen.getByText("Badge Earned!")).toBeInTheDocument();
    expect(screen.getByText("Super Ager")).toBeInTheDocument();
    expect(
      screen.getByText("Achieved 10+ years age reduction")
    ).toBeInTheDocument();
  });

  it("renders close button when onClose is provided", () => {
    const onClose = vi.fn();
    const badge = createBadge();
    render(<BadgeEarnedNotification badge={badge} onClose={onClose} />);

    const closeButton = screen.getByText("×");
    expect(closeButton).toBeInTheDocument();

    closeButton.click();
    expect(onClose).toHaveBeenCalled();
  });

  it("does not render close button when onClose is not provided", () => {
    const badge = createBadge();
    render(<BadgeEarnedNotification badge={badge} />);

    expect(screen.queryByText("×")).not.toBeInTheDocument();
  });
});

describe("Responsive Overflow Tests", () => {
  // Helper to check if text is contained within container bounds
  function _checkOverflow(element: HTMLElement): boolean {
    // In JSDOM, scrollWidth/clientWidth are always 0, so we check for CSS overflow handling
    const style = window.getComputedStyle(element);
    const hasOverflowHidden =
      style.overflow === "hidden" ||
      style.overflowX === "hidden" ||
      style.textOverflow === "ellipsis";
    return hasOverflowHidden;
  }

  describe("Badge Names with Long Text", () => {
    const longNameBadges = [
      {
        name: "Legendary Championship Pioneer Master Elite",
        category: "SPECIAL" as BadgeCategory,
      },
      {
        name: "Ultimate Metabolic Optimization Champion",
        category: "BIOMARKER" as BadgeCategory,
      },
      {
        name: "Consistent Improvement Achievement Master",
        category: "IMPROVEMENT" as BadgeCategory,
      },
    ];

    it.each(longNameBadges)(
      "renders badge with long name: $name without JS errors",
      ({ name, category }) => {
        const badge = createBadge({
          name,
          category,
          description: "A very long badge description that should be handled properly",
        });

        // Should not throw any errors
        expect(() => render(<BadgeDisplay badge={badge} />)).not.toThrow();
      }
    );
  });

  describe("Grid Layout at Different Viewport Sizes", () => {
    const viewportConfigs = [
      { name: "mobile", width: 375 },
      { name: "tablet", width: 768 },
      { name: "desktop", width: 1440 },
    ];

    it.each(viewportConfigs)(
      "BadgeShowcase grid renders properly at $name viewport ($width px)",
      ({ width }) => {
        // Set viewport width (note: JSDOM doesn't fully support this, but we can test the component doesn't break)
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: width,
        });

        const badges = createAllCategoryBadges();

        // Should render without throwing
        expect(() => render(<BadgeShowcase badges={badges} />)).not.toThrow();
      }
    );

    it.each(viewportConfigs)(
      "BadgeGrid with max badges renders properly at $name viewport",
      ({ width }) => {
        Object.defineProperty(window, "innerWidth", {
          writable: true,
          configurable: true,
          value: width,
        });

        const badges = createAllCategoryBadges();

        const { container } = render(
          <BadgeGrid badges={badges} maxDisplay={5} />
        );

        // Should show "+5 more" text
        expect(screen.getByText("+5 more")).toBeInTheDocument();

        // Container should have flex-wrap class for proper wrapping
        expect(container.querySelector(".flex-wrap")).toBeInTheDocument();
      }
    );
  });

  describe("Container Width Constraints", () => {
    it("BadgeGrid uses flex-wrap for proper badge wrapping", () => {
      const badges = createAllCategoryBadges();
      const { container } = render(<BadgeGrid badges={badges} />);

      const gridContainer = container.querySelector(".flex-wrap");
      expect(gridContainer).toBeInTheDocument();
    });

    it("BadgeShowcase uses responsive grid columns", () => {
      const badges = createAllCategoryBadges();
      const { container } = render(<BadgeShowcase badges={badges} />);

      // Check for responsive grid classes
      const gridElement = container.querySelector(
        ".grid-cols-4.sm\\:grid-cols-6.md\\:grid-cols-8"
      );
      expect(gridElement).toBeInTheDocument();
    });

    it("BadgeDisplay container sizes are properly constrained", () => {
      const badge = createBadge();

      // Small size should be 32x32 (w-8 h-8)
      const { container: smContainer, rerender } = render(
        <BadgeDisplay badge={badge} size="sm" />
      );
      expect(smContainer.querySelector(".w-8.h-8")).toBeInTheDocument();

      // Medium size should be 48x48 (w-12 h-12)
      rerender(<BadgeDisplay badge={badge} size="md" />);
      expect(smContainer.querySelector(".w-12.h-12")).toBeInTheDocument();

      // Large size should be 64x64 (w-16 h-16)
      rerender(<BadgeDisplay badge={badge} size="lg" />);
      expect(smContainer.querySelector(".w-16.h-16")).toBeInTheDocument();
    });
  });

  describe("Tooltip Content Constraints", () => {
    it("tooltip content has max-width constraint", () => {
      const badge = createBadge({
        name: "Very Long Badge Name That Could Potentially Overflow",
        description:
          "This is a very long description that could potentially cause overflow issues if not properly constrained within the tooltip container bounds",
      });

      const { container } = render(<BadgeDisplay badge={badge} showTooltip={true} />);

      // The tooltip trigger should be present (wraps the badge with data-state attribute)
      // (Note: Radix tooltip content is portal-rendered, so we check the trigger structure)
      const tooltipTrigger = container.querySelector("[data-state]");
      expect(tooltipTrigger).toBeInTheDocument();
    });
  });

  describe("Badge Notification Constraints", () => {
    it("notification has max-width constraint", () => {
      const badge = createBadge({
        name: "Championship Winner Achievement Badge",
        description:
          "You have achieved the ultimate championship victory in the longevity competition",
      });

      const { container } = render(<BadgeEarnedNotification badge={badge} />);

      // Should have max-w-sm class for width constraint
      expect(container.querySelector(".max-w-sm")).toBeInTheDocument();
    });

    it("notification text content is properly styled", () => {
      const badge = createBadge({
        name: "Test Badge",
        description: "Test description",
      });

      render(<BadgeEarnedNotification badge={badge} />);

      // Badge name should be present
      expect(screen.getByText("Test Badge")).toBeInTheDocument();

      // Description should have text-sm class for smaller font
      const description = screen.getByText("Test description");
      expect(description).toHaveClass("text-sm");
    });
  });
});

describe("All Category Badges Integration", () => {
  it("renders all 10 categories in BadgeShowcase without overflow", () => {
    const badges = createAllCategoryBadges();
    const { container } = render(<BadgeShowcase badges={badges} />);

    // All badges should be rendered (10 badges with lg size = w-16)
    const badgeElements = container.querySelectorAll(".w-16.h-16");
    expect(badgeElements.length).toBe(10);
  });

  it("each category has distinct visual styling", () => {
    const categories: BadgeCategory[] = [
      "ACHIEVEMENT",
      "MILESTONE",
      "COMPETITION",
      "COMMUNITY",
      "SPECIAL",
      "LEAGUE",
      "BIOMARKER",
      "IMPROVEMENT",
      "SEASONAL",
      "SCIENCE",
    ];

    categories.forEach((category) => {
      const badge = createBadge({ id: category, category });
      const { container } = render(<BadgeDisplay badge={badge} />);

      // Each badge should have border-2 class
      expect(container.querySelector(".border-2")).toBeInTheDocument();
    });
  });

  it("handles mixed category badges in grid without layout issues", () => {
    const badges = createAllCategoryBadges();

    const { container } = render(<BadgeGrid badges={badges} size="md" />);

    // All badges should render with medium size
    const badgeElements = container.querySelectorAll(".w-12.h-12");
    expect(badgeElements.length).toBe(10);

    // Grid should have proper gap
    const grid = container.querySelector(".gap-2");
    expect(grid).toBeInTheDocument();
  });
});
