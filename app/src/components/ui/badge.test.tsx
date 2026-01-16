import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders children correctly", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("applies default variant classes", () => {
    render(<Badge data-testid="badge">Default</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("bg-[var(--color-primary)]/10");
  });

  it("applies success variant", () => {
    render(<Badge variant="success" data-testid="badge">Success</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("bg-[var(--color-success)]/10");
    expect(screen.getByTestId("badge")).toHaveClass("text-[var(--color-success)]");
  });

  it("applies warning variant", () => {
    render(<Badge variant="warning" data-testid="badge">Warning</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("bg-[var(--color-warning)]/10");
  });

  it("applies error variant", () => {
    render(<Badge variant="error" data-testid="badge">Error</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("bg-[var(--color-error)]/10");
  });

  it("applies outline variant", () => {
    render(<Badge variant="outline" data-testid="badge">Outline</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("border");
    expect(screen.getByTestId("badge")).toHaveClass("text-[var(--foreground-secondary)]");
  });

  it("applies muted variant", () => {
    render(<Badge variant="muted" data-testid="badge">Muted</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("bg-[var(--background-elevated)]");
    expect(screen.getByTestId("badge")).toHaveClass("text-[var(--foreground-muted)]");
  });

  it("applies gold variant", () => {
    render(<Badge variant="gold" data-testid="badge">1st</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge-gold");
    expect(screen.getByTestId("badge")).toHaveClass("font-bold");
  });

  it("applies silver variant", () => {
    render(<Badge variant="silver" data-testid="badge">2nd</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge-silver");
  });

  it("applies bronze variant", () => {
    render(<Badge variant="bronze" data-testid="badge">3rd</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("badge-bronze");
  });

  it("accepts custom className", () => {
    render(<Badge className="my-custom-class" data-testid="badge">Custom</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("my-custom-class");
  });

  it("spreads additional props", () => {
    render(<Badge aria-label="Status badge" data-testid="badge">Status</Badge>);
    expect(screen.getByTestId("badge")).toHaveAttribute("aria-label", "Status badge");
  });
});
