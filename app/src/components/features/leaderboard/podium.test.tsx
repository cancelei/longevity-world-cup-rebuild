import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Podium } from './podium';
import type { LeaderboardEntry } from '@/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h2 {...props}>{children}</h2>,
  },
}));

const createMockEntry = (rank: number, name: string, ageReduction: number): LeaderboardEntry => ({
  rank,
  athlete: {
    id: `athlete-${rank}`,
    userId: `user-${rank}`,
    displayName: name,
    slug: name.toLowerCase().replace(' ', '-'),
    profilePicture: `/avatar-${rank}.jpg`,
    division: 'open',
    generation: 'millennial',
    chronologicalAge: 35,
    status: 'verified',
    isPublic: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  bestAgeReduction: ageReduction,
  latestSubmission: {
    id: `submission-${rank}`,
    athleteId: `athlete-${rank}`,
    phenoAge: 35 - ageReduction,
    paceOfAging: (35 - ageReduction) / 35,
    status: 'approved',
    biomarkers: {
      albumin: 4.5,
      creatinine: 0.9,
      glucose: 85,
      crp: 0.5,
      lymphocytePercent: 30,
      mcv: 90,
      rdw: 12.5,
      alp: 70,
      wbc: 6.0,
    },
    submittedAt: new Date().toISOString(),
    reviewedAt: new Date().toISOString(),
  },
  totalSubmissions: 3,
  rankChange: 0,
  isNew: false,
});

const mockEntries: LeaderboardEntry[] = [
  createMockEntry(1, 'Gold Winner', 10.5),
  createMockEntry(2, 'Silver Winner', 8.3),
  createMockEntry(3, 'Bronze Winner', 6.1),
];

describe('Podium', () => {
  it('should render the podium title', () => {
    render(<Podium entries={mockEntries} />);

    expect(screen.getByText('Top Athletes')).toBeInTheDocument();
  });

  it('should display all three athletes', () => {
    render(<Podium entries={mockEntries} />);

    expect(screen.getByText('Gold Winner')).toBeInTheDocument();
    expect(screen.getByText('Silver Winner')).toBeInTheDocument();
    expect(screen.getByText('Bronze Winner')).toBeInTheDocument();
  });

  it('should display position badges', () => {
    render(<Podium entries={mockEntries} />);

    expect(screen.getByText('1st')).toBeInTheDocument();
    expect(screen.getByText('2nd')).toBeInTheDocument();
    expect(screen.getByText('3rd')).toBeInTheDocument();
  });

  it('should display age reduction values', () => {
    render(<Podium entries={mockEntries} />);

    expect(screen.getByText('-10.5 years')).toBeInTheDocument();
    expect(screen.getByText('-8.3 years')).toBeInTheDocument();
    expect(screen.getByText('-6.1 years')).toBeInTheDocument();
  });

  it('should display biological ages', () => {
    render(<Podium entries={mockEntries} />);

    // Bio age = chronological (35) - age reduction
    expect(screen.getByText('Biological Age: 24.5')).toBeInTheDocument();
    expect(screen.getByText('Biological Age: 26.7')).toBeInTheDocument();
    expect(screen.getByText('Biological Age: 28.9')).toBeInTheDocument();
  });

  it('should display prize pool when provided', () => {
    const prizePool = {
      first: 50000,
      second: 25000,
      third: 10000,
      currency: 'USD',
    };

    render(<Podium entries={mockEntries} prizePool={prizePool} />);

    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('$25,000')).toBeInTheDocument();
    expect(screen.getByText('$10,000')).toBeInTheDocument();
  });

  it('should not display prize pool when not provided', () => {
    render(<Podium entries={mockEntries} />);

    expect(screen.queryByText('$50,000')).not.toBeInTheDocument();
  });

  it('should call onAthleteClick when an athlete is clicked', async () => {
    const user = userEvent.setup();
    const onAthleteClick = vi.fn();

    render(<Podium entries={mockEntries} onAthleteClick={onAthleteClick} />);

    const goldWinner = screen.getByText('Gold Winner').closest('[class*="cursor-pointer"]');
    if (goldWinner) {
      await user.click(goldWinner);
    }

    expect(onAthleteClick).toHaveBeenCalledWith('athlete-1');
  });

  it('should handle fewer than 3 entries', () => {
    const twoEntries = mockEntries.slice(0, 2);
    render(<Podium entries={twoEntries} />);

    expect(screen.getByText('Gold Winner')).toBeInTheDocument();
    expect(screen.queryByText('Bronze Winner')).not.toBeInTheDocument();
  });

  it('should handle empty entries', () => {
    render(<Podium entries={[]} />);

    expect(screen.getByText('Top Athletes')).toBeInTheDocument();
  });

  it('should display avatar fallback initials', () => {
    render(<Podium entries={mockEntries} />);

    // Each athlete should have fallback initials
    expect(screen.getByText('GO')).toBeInTheDocument(); // Gold Winner
    expect(screen.getByText('SI')).toBeInTheDocument(); // Silver Winner
    expect(screen.getByText('BR')).toBeInTheDocument(); // Bronze Winner
  });
});
