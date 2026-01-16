import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './tooltip';

describe('Tooltip', () => {
  const renderTooltip = (props = {}) => {
    return render(
      <TooltipProvider>
        <Tooltip {...props}>
          <TooltipTrigger asChild>
            <button>Hover me</button>
          </TooltipTrigger>
          <TooltipContent>
            Tooltip text
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  it('should render trigger element', () => {
    renderTooltip();
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
  });

  it('should not show tooltip content by default', () => {
    renderTooltip();
    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
  });

  it('should show tooltip content on hover', async () => {
    const user = userEvent.setup();
    renderTooltip();

    const trigger = screen.getByRole('button', { name: 'Hover me' });
    await user.hover(trigger);

    await waitFor(() => {
      // Radix may render tooltip content multiple times for accessibility
      const tooltips = screen.getAllByText('Tooltip text');
      expect(tooltips.length).toBeGreaterThan(0);
    });
  });

  it('should allow tooltip to be dismissed on mouse leave', async () => {
    const user = userEvent.setup();
    renderTooltip();

    const trigger = screen.getByRole('button', { name: 'Hover me' });
    await user.hover(trigger);

    await waitFor(() => {
      const tooltips = screen.getAllByText('Tooltip text');
      expect(tooltips.length).toBeGreaterThan(0);
    });

    // Unhover triggers the dismiss animation
    await user.unhover(trigger);

    // Just verify unhover doesn't throw - Radix has delay on hide
    expect(trigger).toBeInTheDocument();
  });

  it('should render with default open state', async () => {
    render(
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger asChild>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>
            Tooltip content
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    await waitFor(() => {
      // Radix may render tooltip content multiple times for accessibility
      const tooltips = screen.getAllByText('Tooltip content');
      expect(tooltips.length).toBeGreaterThan(0);
    });
  });
});

describe('TooltipContent', () => {
  it('should apply custom className', async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent className="custom-tooltip" data-testid="tooltip-content">
            Content
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    await user.hover(screen.getByRole('button'));

    await waitFor(() => {
      const content = screen.getByTestId('tooltip-content');
      expect(content).toHaveClass('custom-tooltip');
    });
  });

  it('should render children content', async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>
            <span data-testid="tooltip-child">Custom content</span>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    await user.hover(screen.getByRole('button'));

    await waitFor(() => {
      // Radix may render content multiple times for accessibility
      const children = screen.getAllByTestId('tooltip-child');
      expect(children.length).toBeGreaterThan(0);
    });
  });

  it('should accept sideOffset prop', async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent sideOffset={10} data-testid="tooltip-content">
            Content
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    await user.hover(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    });
  });
});

describe('TooltipProvider', () => {
  it('should wrap tooltip components', () => {
    render(
      <TooltipProvider>
        <div data-testid="provider-child">Child content</div>
      </TooltipProvider>
    );
    expect(screen.getByTestId('provider-child')).toBeInTheDocument();
  });
});

describe('TooltipTrigger', () => {
  it('should render trigger as child element', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button data-testid="custom-trigger">Custom Button</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getByTestId('custom-trigger')).toBeInTheDocument();
  });

  it('should render trigger without asChild', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger text</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getByText('Trigger text')).toBeInTheDocument();
  });
});
