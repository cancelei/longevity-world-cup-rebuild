import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
  LeaderboardRowSkeleton,
  LeaderboardSkeleton,
  AthleteCardSkeleton,
  PodiumSkeleton,
  StatsCardSkeleton,
  ChartSkeleton,
  ProfileSkeleton,
} from './skeleton';

describe('Skeleton', () => {
  it('should render skeleton element', () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });

  it('should have animation class', () => {
    render(<Skeleton data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('animate-pulse');
  });

  it('should apply custom className', () => {
    render(<Skeleton className="h-10 w-20" data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('h-10');
    expect(skeleton).toHaveClass('w-20');
  });

  it('should spread additional props', () => {
    render(<Skeleton data-testid="skeleton" aria-hidden="true" />);
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('SkeletonText', () => {
  it('should render text skeleton', () => {
    const { container } = render(<SkeletonText />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should have default height and width classes', () => {
    const { container } = render(<SkeletonText />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('h-4');
    expect(skeleton).toHaveClass('w-full');
  });

  it('should apply custom className', () => {
    const { container } = render(<SkeletonText className="w-1/2" />);
    expect(container.firstChild).toHaveClass('w-1/2');
  });
});

describe('SkeletonCircle', () => {
  it('should render circular skeleton', () => {
    const { container } = render(<SkeletonCircle />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should have rounded-full class', () => {
    const { container } = render(<SkeletonCircle />);
    expect(container.firstChild).toHaveClass('rounded-full');
  });

  it('should have default size classes', () => {
    const { container } = render(<SkeletonCircle />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('h-10');
    expect(skeleton).toHaveClass('w-10');
  });
});

describe('SkeletonCard', () => {
  it('should render card skeleton', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should contain skeleton elements', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});

describe('LeaderboardRowSkeleton', () => {
  it('should render leaderboard row skeleton', () => {
    const { container } = render(<LeaderboardRowSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should contain multiple skeleton elements', () => {
    const { container } = render(<LeaderboardRowSkeleton />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});

describe('LeaderboardSkeleton', () => {
  it('should render 10 leaderboard row skeletons', () => {
    const { container } = render(<LeaderboardSkeleton />);
    // Should have multiple rows
    expect(container.firstChild?.childNodes.length).toBe(10);
  });
});

describe('AthleteCardSkeleton', () => {
  it('should render athlete card skeleton', () => {
    const { container } = render(<AthleteCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});

describe('PodiumSkeleton', () => {
  it('should render podium skeleton with 3 positions', () => {
    const { container } = render(<PodiumSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
    // Should have 3 podium positions
    expect(container.firstChild?.childNodes.length).toBe(3);
  });
});

describe('StatsCardSkeleton', () => {
  it('should render stats card skeleton', () => {
    const { container } = render(<StatsCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});

describe('ChartSkeleton', () => {
  it('should render chart skeleton', () => {
    const { container } = render(<ChartSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should have multiple bar elements', () => {
    const { container } = render(<ChartSkeleton />);
    // Should have 12 chart bars based on chartBarHeights array
    const bars = container.querySelectorAll('[style*="height"]');
    expect(bars.length).toBe(12);
  });
});

describe('ProfileSkeleton', () => {
  it('should render profile skeleton', () => {
    const { container } = render(<ProfileSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should contain stats card skeletons', () => {
    const { container } = render(<ProfileSkeleton />);
    // Should have multiple skeleton elements including stats cards
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
  });
});
