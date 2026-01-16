import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from './progress';

describe('Progress', () => {
  it('should render progress bar', () => {
    render(<Progress value={50} data-testid="progress" />);
    expect(screen.getByTestId('progress')).toBeInTheDocument();
  });

  it('should render with 0 value', () => {
    render(<Progress value={0} data-testid="progress" />);
    expect(screen.getByTestId('progress')).toBeInTheDocument();
  });

  it('should render with 100 value', () => {
    render(<Progress value={100} data-testid="progress" />);
    expect(screen.getByTestId('progress')).toBeInTheDocument();
  });

  it('should render with default variant', () => {
    const { container } = render(<Progress value={50} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render with success variant', () => {
    const { container } = render(<Progress value={50} variant="success" />);
    expect(container.querySelector('[class*="success"]')).toBeInTheDocument();
  });

  it('should render with warning variant', () => {
    const { container } = render(<Progress value={50} variant="warning" />);
    expect(container.querySelector('[class*="warning"]')).toBeInTheDocument();
  });

  it('should render with error variant', () => {
    const { container } = render(<Progress value={50} variant="error" />);
    expect(container.querySelector('[class*="error"]')).toBeInTheDocument();
  });

  it('should show label when showLabel is true', () => {
    render(<Progress value={75} showLabel />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should not show label by default', () => {
    render(<Progress value={75} />);
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Progress value={50} className="custom-progress" data-testid="progress" />);
    expect(screen.getByTestId('progress')).toHaveClass('custom-progress');
  });

  it('should forward ref', () => {
    const ref = { current: null };
    render(<Progress value={50} ref={ref} />);
    expect(ref.current).toBeTruthy();
  });

  it('should handle undefined value', () => {
    render(<Progress data-testid="progress" />);
    expect(screen.getByTestId('progress')).toBeInTheDocument();
  });

  it('should spread additional props', () => {
    render(<Progress value={50} aria-label="Loading progress" data-testid="progress" />);
    expect(screen.getByTestId('progress')).toHaveAttribute('aria-label', 'Loading progress');
  });
});
