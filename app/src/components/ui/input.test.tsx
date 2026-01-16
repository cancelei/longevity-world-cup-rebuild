import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './input';

describe('Input', () => {
  it('should render an input element', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('should render with label when provided', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('should associate label with input via htmlFor', () => {
    render(<Input label="Email" id="email-input" />);
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email-input');
  });

  it('should generate id automatically when not provided', () => {
    render(<Input label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('id');
  });

  it('should display hint text when provided', () => {
    render(<Input hint="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('should display error message when provided', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should hide hint when error is displayed', () => {
    render(<Input hint="Enter your email" error="Invalid email" />);
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('should apply error styles when error is provided', () => {
    render(<Input error="Error" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input.className).toContain('error');
  });

  it('should handle different input types', () => {
    const { rerender } = render(<Input type="text" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');

    rerender(<Input type="password" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');

    rerender(<Input type="email" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');

    rerender(<Input type="number" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled data-testid="input" />);
    expect(screen.getByTestId('input')).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<Input className="custom-input" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveClass('custom-input');
  });

  it('should handle onChange events', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input onChange={handleChange} data-testid="input" />);
    const input = screen.getByTestId('input');

    await user.type(input, 'test');
    expect(handleChange).toHaveBeenCalled();
  });

  it('should handle user typing', async () => {
    const user = userEvent.setup();
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');

    await user.type(input, 'Hello World');
    expect(input).toHaveValue('Hello World');
  });

  it('should forward ref', () => {
    const ref = { current: null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('should spread additional props', () => {
    render(
      <Input
        data-testid="input"
        placeholder="Enter text"
        maxLength={50}
        required
        aria-describedby="helper"
      />
    );
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
    expect(input).toHaveAttribute('maxLength', '50');
    expect(input).toBeRequired();
    expect(input).toHaveAttribute('aria-describedby', 'helper');
  });

  it('should handle focus and blur events', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();

    render(<Input onFocus={onFocus} onBlur={onBlur} data-testid="input" />);
    const input = screen.getByTestId('input');

    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledTimes(1);

    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('should render without label, hint, or error', () => {
    const { container } = render(<Input data-testid="input" />);
    expect(screen.getByTestId('input')).toBeInTheDocument();
    // Should only have the wrapper div and input
    expect(container.querySelector('label')).not.toBeInTheDocument();
    expect(container.querySelectorAll('p')).toHaveLength(0);
  });

  it('should have proper accessibility attributes', () => {
    render(<Input label="Username" error="Username is required" data-testid="input" />);
    // Input should be labeled
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });
});
