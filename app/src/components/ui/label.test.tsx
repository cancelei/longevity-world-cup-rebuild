import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  it('should render label with text content', () => {
    render(<Label>Email Address</Label>);
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('should render as a label element', () => {
    render(<Label data-testid="label">Text</Label>);
    const label = screen.getByTestId('label');
    expect(label.tagName).toBe('LABEL');
  });

  it('should apply htmlFor attribute', () => {
    render(<Label htmlFor="email-input">Email</Label>);
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email-input');
  });

  it('should apply custom className', () => {
    render(<Label className="custom-label" data-testid="label">Text</Label>);
    expect(screen.getByTestId('label')).toHaveClass('custom-label');
  });

  it('should forward ref', () => {
    const ref = { current: null };
    render(<Label ref={ref}>Text</Label>);
    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it('should spread additional props', () => {
    render(<Label data-testid="label" aria-hidden="true">Text</Label>);
    expect(screen.getByTestId('label')).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render children elements', () => {
    render(
      <Label>
        <span data-testid="child">Required</span>
        <span className="required">*</span>
      </Label>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should have proper default styling classes', () => {
    render(<Label data-testid="label">Text</Label>);
    const label = screen.getByTestId('label');
    expect(label).toHaveClass('text-sm');
    expect(label).toHaveClass('font-medium');
  });
});
