import { describe, it, expect, vi } from 'vitest';
import { render, screen} from '@testing-library/react';
import { Slider } from './slider';

describe('Slider', () => {
  it('should render slider element', () => {
    render(<Slider defaultValue={[50]} data-testid="slider" />);
    expect(screen.getByTestId('slider')).toBeInTheDocument();
  });

  it('should render with default value', () => {
    render(<Slider defaultValue={[25]} data-testid="slider" />);
    expect(screen.getByTestId('slider')).toBeInTheDocument();
  });

  it('should render with controlled value', () => {
    render(<Slider value={[75]} data-testid="slider" />);
    expect(screen.getByTestId('slider')).toBeInTheDocument();
  });

  it('should show value when showValue is true', () => {
    render(<Slider value={[42]} showValue />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should not show value by default', () => {
    render(<Slider value={[42]} />);
    expect(screen.queryByText('42')).not.toBeInTheDocument();
  });

  it('should format value when formatValue is provided', () => {
    const formatValue = (value: number) => `${value}%`;
    render(<Slider value={[50]} showValue formatValue={formatValue} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should use defaultValue when value is not provided for display', () => {
    render(<Slider defaultValue={[30]} showValue />);
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('should show 0 when no value or defaultValue is provided', () => {
    render(<Slider showValue />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Slider defaultValue={[50]} className="custom-slider" data-testid="slider" />);
    expect(screen.getByTestId('slider')).toHaveClass('custom-slider');
  });

  it('should forward ref', () => {
    const ref = { current: null };
    render(<Slider defaultValue={[50]} ref={ref} />);
    expect(ref.current).toBeTruthy();
  });

  it('should handle min and max props', () => {
    render(<Slider defaultValue={[5]} min={0} max={10} data-testid="slider" />);
    expect(screen.getByTestId('slider')).toBeInTheDocument();
  });

  it('should handle step prop', () => {
    render(<Slider defaultValue={[50]} step={10} data-testid="slider" />);
    expect(screen.getByTestId('slider')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Slider defaultValue={[50]} disabled data-testid="slider" />);
    expect(screen.getByTestId('slider')).toHaveAttribute('data-disabled');
  });

  it('should handle onValueChange callback', () => {
    const onValueChange = vi.fn();
    render(
      <Slider
        defaultValue={[50]}
        onValueChange={onValueChange}
        data-testid="slider"
      />
    );
    expect(screen.getByTestId('slider')).toBeInTheDocument();
  });

  it('should render thumb element', () => {
    const { container } = render(<Slider defaultValue={[50]} />);
    const thumb = container.querySelector('[class*="rounded-full"][class*="border"]');
    expect(thumb).toBeInTheDocument();
  });

  it('should render track element', () => {
    const { container } = render(<Slider defaultValue={[50]} />);
    const track = container.querySelector('[class*="overflow-hidden"]');
    expect(track).toBeInTheDocument();
  });
});
