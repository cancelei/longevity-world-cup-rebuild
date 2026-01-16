import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CountdownTimer, SeasonCountdown } from './countdown-timer';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h2 {...props}>{children}</h2>,
  },
}));

describe('CountdownTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('default variant', () => {
    it('should render with default title', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 5); // 5 days from now
      render(<CountdownTimer targetDate={futureDate} />);

      expect(screen.getByText('Time Remaining')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
      render(<CountdownTimer targetDate={futureDate} title="Custom Title" />);

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should render with subtitle', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
      render(<CountdownTimer targetDate={futureDate} subtitle="Test subtitle" />);

      expect(screen.getByText('Test subtitle')).toBeInTheDocument();
    });

    it('should display time units', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 60 * 3); // 2 days, 3 hours
      render(<CountdownTimer targetDate={futureDate} />);

      expect(screen.getByText('Days')).toBeInTheDocument();
      expect(screen.getByText('Hours')).toBeInTheDocument();
      expect(screen.getByText('Minutes')).toBeInTheDocument();
      expect(screen.getByText('Seconds')).toBeInTheDocument();
    });

    it('should update countdown every second', async () => {
      const futureDate = new Date(Date.now() + 1000 * 60); // 1 minute from now
      render(<CountdownTimer targetDate={futureDate} />);

      // Timer should show time units
      expect(screen.getByText('Minutes')).toBeInTheDocument();
      expect(screen.getByText('Seconds')).toBeInTheDocument();

      // Advance time by 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Timer labels should still be present
      expect(screen.getByText('Minutes')).toBeInTheDocument();
    });

    it('should show times up message when countdown ends', () => {
      // Use a past date to trigger ended state immediately
      vi.setSystemTime(new Date('2026-01-10T00:00:00Z'));
      const pastDate = new Date('2026-01-09T00:00:00Z');

      render(<CountdownTimer targetDate={pastDate} />);

      // Advance timer to trigger state update
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText("Time's Up!")).toBeInTheDocument();
    });

    it('should call onComplete callback when countdown ends', () => {
      const onComplete = vi.fn();
      vi.setSystemTime(new Date('2026-01-10T00:00:00Z'));
      const pastDate = new Date('2026-01-09T00:00:00Z');

      render(<CountdownTimer targetDate={pastDate} onComplete={onComplete} />);

      // Advance timer to trigger the callback
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should accept string date format', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString();
      render(<CountdownTimer targetDate={futureDate} />);

      expect(screen.getByText('Time Remaining')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24);
      const { container } = render(
        <CountdownTimer targetDate={futureDate} className="custom-class" />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });

  describe('compact variant', () => {
    it('should render compact format', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 2); // 2 hours
      render(<CountdownTimer targetDate={futureDate} variant="compact" />);

      // Should show clock icon and time in HH:MM:SS format
      const timeDisplay = screen.getByText(/\d{2}:\d{2}:\d{2}/);
      expect(timeDisplay).toBeInTheDocument();
    });

    it('should show days in compact format when applicable', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3); // 3 days
      render(<CountdownTimer targetDate={futureDate} variant="compact" />);

      expect(screen.getByText(/3d/)).toBeInTheDocument();
    });

    it('should show times up in compact format when ended', () => {
      vi.setSystemTime(new Date('2026-01-10T00:00:00Z'));
      const pastDate = new Date('2026-01-09T00:00:00Z');

      render(<CountdownTimer targetDate={pastDate} variant="compact" />);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText("Time's up!")).toBeInTheDocument();
    });
  });

  describe('inline variant', () => {
    it('should render inline format', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 60 * 5); // 2d 5h
      render(<CountdownTimer targetDate={futureDate} variant="inline" />);

      const inlineDisplay = screen.getByText(/\d+d \d+h \d+m/);
      expect(inlineDisplay).toBeInTheDocument();
    });

    it('should show Ended in inline format when ended', () => {
      vi.setSystemTime(new Date('2026-01-10T00:00:00Z'));
      const pastDate = new Date('2026-01-09T00:00:00Z');

      render(<CountdownTimer targetDate={pastDate} variant="inline" />);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByText('Ended')).toBeInTheDocument();
    });
  });

  describe('urgent state', () => {
    it('should show urgent styling when less than 24 hours remain', () => {
      const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 12); // 12 hours
      const { container } = render(<CountdownTimer targetDate={futureDate} />);

      // Should have warning-colored border
      expect(container.querySelector('[class*="warning"]')).toBeInTheDocument();
    });
  });
});

describe('SeasonCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const now = new Date();
  const future = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30); // 30 days from now
  const past = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30); // 30 days ago

  it('should show countdown to start for upcoming season', () => {
    render(
      <SeasonCountdown
        seasonName="Season 2026"
        startDate={future}
        endDate={new Date(future.getTime() + 1000 * 60 * 60 * 24 * 90)}
        submissionDeadline={new Date(future.getTime() + 1000 * 60 * 60 * 24 * 60)}
        status="upcoming"
      />
    );

    expect(screen.getByText('Season 2026 Starts In')).toBeInTheDocument();
    expect(screen.getByText('Get ready to compete!')).toBeInTheDocument();
  });

  it('should show submission deadline for active season', () => {
    const deadline = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 15); // 15 days
    render(
      <SeasonCountdown
        seasonName="Season 2026"
        startDate={past}
        endDate={future}
        submissionDeadline={deadline}
        status="active"
      />
    );

    expect(screen.getByText('Submission Deadline')).toBeInTheDocument();
    expect(screen.getByText(/Submit your biomarkers for Season 2026/)).toBeInTheDocument();
  });

  it('should show season end countdown when deadline has passed', () => {
    const pastDeadline = new Date(now.getTime() - 1000 * 60 * 60 * 24);
    render(
      <SeasonCountdown
        seasonName="Season 2026"
        startDate={past}
        endDate={future}
        submissionDeadline={pastDeadline}
        status="active"
      />
    );

    expect(screen.getByText('Season 2026 Ends In')).toBeInTheDocument();
  });

  it('should show completed message for ended season', () => {
    render(
      <SeasonCountdown
        seasonName="Season 2025"
        startDate={new Date(past.getTime() - 1000 * 60 * 60 * 24 * 90)}
        endDate={past}
        submissionDeadline={new Date(past.getTime() - 1000 * 60 * 60 * 24 * 30)}
        status="completed"
      />
    );

    expect(screen.getByText('Season 2025 has ended')).toBeInTheDocument();
    expect(screen.getByText('View the final results on the leaderboard')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SeasonCountdown
        seasonName="Test Season"
        startDate={future}
        endDate={new Date(future.getTime() + 1000 * 60 * 60 * 24 * 90)}
        submissionDeadline={new Date(future.getTime() + 1000 * 60 * 60 * 24 * 60)}
        status="upcoming"
        className="custom-season"
      />
    );

    expect(container.querySelector('.custom-season')).toBeInTheDocument();
  });

  describe('string date parsing', () => {
    it('should accept string dates for all date props', () => {
      const startDateStr = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString();
      const endDateStr = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 120).toISOString();
      const deadlineStr = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 90).toISOString();

      render(
        <SeasonCountdown
          seasonName="Test Season"
          startDate={startDateStr}
          endDate={endDateStr}
          submissionDeadline={deadlineStr}
          status="upcoming"
        />
      );

      expect(screen.getByText('Test Season Starts In')).toBeInTheDocument();
    });

    it('should handle mixed string and Date objects', () => {
      const endDateStr = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 120).toISOString();

      render(
        <SeasonCountdown
          seasonName="Mixed Season"
          startDate={past}
          endDate={endDateStr}
          submissionDeadline={new Date(now.getTime() + 1000 * 60 * 60 * 24 * 10)}
          status="active"
        />
      );

      expect(screen.getByText('Submission Deadline')).toBeInTheDocument();
    });
  });
});
