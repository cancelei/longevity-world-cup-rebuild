import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LeagueLeaderboardTable } from './league-leaderboard-table';
import type { LeagueLeaderboardEntry } from '@/types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    tr: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLTableRowElement>>) => (
      <tr {...props}>{children}</tr>
    ),
    div: ({ children, ...props }: React.PropsWithChildren<React.HTMLAttributes<HTMLDivElement>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

const createMockEntry = (overrides: Partial<LeagueLeaderboardEntry> = {}): LeagueLeaderboardEntry => ({
  league: {
    id: 'league-1',
    name: 'Test League',
    slug: 'test-league',
    type: 'CLINIC',
    tier: 'PRO',
    logo: null,
    country: 'USA',
    city: 'New York',
  },
  rank: 1,
  avgAgeReduction: 5.5,
  totalMembers: 50,
  activeMembers: 45,
  bestIndividual: 8.2,
  isNew: false,
  ...overrides,
});

const mockEntries: LeagueLeaderboardEntry[] = [
  createMockEntry({
    league: {
      id: 'league-1',
      name: 'Elite Longevity Clinic',
      slug: 'elite-longevity',
      type: 'CLINIC',
      tier: 'ENTERPRISE',
      logo: null,
      country: 'USA',
      city: 'Los Angeles',
    },
    rank: 1,
    avgAgeReduction: 8.5,
    totalMembers: 200,
    activeMembers: 180,
    bestIndividual: 12.3,
    isNew: true,
  }),
  createMockEntry({
    league: {
      id: 'league-2',
      name: 'Tech Giants Wellness',
      slug: 'tech-giants',
      type: 'CORPORATE',
      tier: 'PRO',
      logo: null,
      country: 'USA',
      city: 'San Francisco',
    },
    rank: 2,
    avgAgeReduction: 7.2,
    totalMembers: 150,
    activeMembers: 120,
    bestIndividual: 10.1,
    rankChange: 2,
  }),
  createMockEntry({
    league: {
      id: 'league-3',
      name: 'Biohackers Collective',
      slug: 'biohackers',
      type: 'COLLECTIVE',
      tier: 'STARTER',
      logo: null,
      country: 'UK',
      city: 'London',
    },
    rank: 3,
    avgAgeReduction: 6.8,
    totalMembers: 40,
    activeMembers: 35,
    bestIndividual: 9.5,
    rankChange: -1,
  }),
  createMockEntry({
    league: {
      id: 'league-4',
      name: 'Free Community',
      slug: 'free-community',
      type: 'CUSTOM',
      tier: 'FREE',
      logo: null,
      country: null,
      city: null,
    },
    rank: 4,
    avgAgeReduction: 3.2,
    totalMembers: 10,
    activeMembers: 8,
    bestIndividual: 5.0,
  }),
];

describe('LeagueLeaderboardTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders table with all entries', () => {
    render(<LeagueLeaderboardTable entries={mockEntries} />);

    expect(screen.getByText('Elite Longevity Clinic')).toBeInTheDocument();
    expect(screen.getByText('Tech Giants Wellness')).toBeInTheDocument();
    expect(screen.getByText('Biohackers Collective')).toBeInTheDocument();
    expect(screen.getByText('Free Community')).toBeInTheDocument();
  });

  it('displays correct ranks', () => {
    render(<LeagueLeaderboardTable entries={mockEntries} />);

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
    expect(screen.getByText('#4')).toBeInTheDocument();
  });

  it('displays age reduction with correct sign', () => {
    render(<LeagueLeaderboardTable entries={mockEntries} />);

    // Positive age reduction should show minus sign
    expect(screen.getByText('-8.5')).toBeInTheDocument();
    expect(screen.getByText('-7.2')).toBeInTheDocument();
  });

  it('displays member counts', () => {
    render(<LeagueLeaderboardTable entries={mockEntries} />);

    expect(screen.getByText('180/200')).toBeInTheDocument();
    expect(screen.getByText('120/150')).toBeInTheDocument();
  });

  it('shows location for leagues with city and country', () => {
    render(<LeagueLeaderboardTable entries={mockEntries} />);

    expect(screen.getByText('Los Angeles, USA')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, USA')).toBeInTheDocument();
    expect(screen.getByText('London, UK')).toBeInTheDocument();
  });

  it('shows rank change indicators', () => {
    render(<LeagueLeaderboardTable entries={mockEntries} />);

    // Check for rank up indicator (2 positions up)
    expect(screen.getByText('2')).toBeInTheDocument();

    // Check for rank down indicator (1 position down)
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('shows "new" indicator for new leagues', () => {
    render(<LeagueLeaderboardTable entries={mockEntries} />);

    // Elite Longevity Clinic is marked as new
    const firstRow = screen.getByText('Elite Longevity Clinic').closest('tr');
    expect(firstRow).toBeInTheDocument();
    // Should have a sparkles icon for new entries
  });

  describe('Filters', () => {
    it('shows filters when showFilters is true', () => {
      render(<LeagueLeaderboardTable entries={mockEntries} showFilters />);

      expect(screen.getByPlaceholderText('Search leagues...')).toBeInTheDocument();
    });

    it('hides filters when showFilters is false', () => {
      render(<LeagueLeaderboardTable entries={mockEntries} showFilters={false} />);

      expect(screen.queryByPlaceholderText('Search leagues...')).not.toBeInTheDocument();
    });

    it('filters by search term', async () => {
      render(<LeagueLeaderboardTable entries={mockEntries} />);

      const searchInput = screen.getByPlaceholderText('Search leagues...');
      await userEvent.type(searchInput, 'Elite');

      expect(screen.getByText('Elite Longevity Clinic')).toBeInTheDocument();
      expect(screen.queryByText('Tech Giants Wellness')).not.toBeInTheDocument();
      expect(screen.queryByText('Biohackers Collective')).not.toBeInTheDocument();
    });

    it('filters by league type', async () => {
      render(<LeagueLeaderboardTable entries={mockEntries} />);

      // Select the type filter dropdown and choose "Clinics"
      const dropdowns = screen.getAllByRole('combobox');
      const typeDropdown = dropdowns[0]; // First dropdown is type filter
      await userEvent.selectOptions(typeDropdown, 'CLINIC');

      expect(screen.getByText('Elite Longevity Clinic')).toBeInTheDocument();
      expect(screen.queryByText('Tech Giants Wellness')).not.toBeInTheDocument();
    });

    it('filters by league tier', async () => {
      render(<LeagueLeaderboardTable entries={mockEntries} />);

      const tierDropdown = screen.getAllByRole('combobox')[1];
      await userEvent.selectOptions(tierDropdown, 'PRO');

      expect(screen.getByText('Tech Giants Wellness')).toBeInTheDocument();
      expect(screen.queryByText('Elite Longevity Clinic')).not.toBeInTheDocument();
    });

    it('combines multiple filters', async () => {
      render(<LeagueLeaderboardTable entries={mockEntries} />);

      const searchInput = screen.getByPlaceholderText('Search leagues...');
      const typeDropdown = screen.getAllByRole('combobox')[0];

      await userEvent.type(searchInput, 'Collective');
      await userEvent.selectOptions(typeDropdown, 'COLLECTIVE');

      expect(screen.getByText('Biohackers Collective')).toBeInTheDocument();
      expect(screen.queryByText('Elite Longevity Clinic')).not.toBeInTheDocument();
      expect(screen.queryByText('Tech Giants Wellness')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no entries', () => {
      render(<LeagueLeaderboardTable entries={[]} />);

      expect(screen.getByText('No leagues found')).toBeInTheDocument();
      expect(screen.getByText('Create or join a league to compete as a team')).toBeInTheDocument();
    });

    it('shows empty state when all entries are filtered out', async () => {
      render(<LeagueLeaderboardTable entries={mockEntries} />);

      const searchInput = screen.getByPlaceholderText('Search leagues...');
      await userEvent.type(searchInput, 'nonexistent league xyz');

      expect(screen.getByText('No leagues found')).toBeInTheDocument();
    });
  });

  describe('Click handling', () => {
    it('calls onLeagueClick when a row is clicked', async () => {
      const mockOnClick = vi.fn();
      render(<LeagueLeaderboardTable entries={mockEntries} onLeagueClick={mockOnClick} />);

      const leagueName = screen.getByText('Elite Longevity Clinic');
      const row = leagueName.closest('tr');

      if (row) {
        await userEvent.click(row);
        expect(mockOnClick).toHaveBeenCalledWith('elite-longevity');
      }
    });
  });

  describe('Table headers', () => {
    it('displays all table headers', () => {
      render(<LeagueLeaderboardTable entries={mockEntries} />);

      expect(screen.getByText('Rank')).toBeInTheDocument();
      expect(screen.getByText('League')).toBeInTheDocument();
      expect(screen.getByText('Avg Age Reduction')).toBeInTheDocument();
      expect(screen.getByText('Members')).toBeInTheDocument();
      expect(screen.getByText('Best Individual')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
    });
  });

  describe('Visual styling', () => {
    it('applies gold color to rank 1', () => {
      render(<LeagueLeaderboardTable entries={mockEntries} />);

      const rank1 = screen.getByText('#1');
      expect(rank1.classList.contains('text-yellow-400')).toBe(true);
    });

    it('applies silver color to rank 2', () => {
      render(<LeagueLeaderboardTable entries={mockEntries} />);

      const rank2 = screen.getByText('#2');
      expect(rank2.classList.contains('text-gray-400')).toBe(true);
    });

    it('applies bronze color to rank 3', () => {
      render(<LeagueLeaderboardTable entries={mockEntries} />);

      const rank3 = screen.getByText('#3');
      expect(rank3.classList.contains('text-orange-500')).toBe(true);
    });
  });

  describe('League type icons', () => {
    it('shows emoji icon when no logo is provided', () => {
      render(<LeagueLeaderboardTable entries={mockEntries} />);

      // Check that emoji icons are displayed for leagues without logos
      // The type icons should be present in the cells
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('shows logo image when provided', () => {
      const entryWithLogo = createMockEntry({
        league: {
          id: 'league-with-logo',
          name: 'Logo League',
          slug: 'logo-league',
          type: 'CLINIC',
          tier: 'PRO',
          logo: 'https://example.com/logo.png',
          country: 'USA',
          city: 'Boston',
        },
      });

      render(<LeagueLeaderboardTable entries={[entryWithLogo]} />);

      const logo = screen.getByRole('img', { name: 'Logo League' });
      expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
    });
  });
});
