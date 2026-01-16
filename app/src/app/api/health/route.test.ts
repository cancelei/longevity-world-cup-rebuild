import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';

import { prisma } from '@/lib/db';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

describe('Health Check API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return healthy status when database is accessible', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ '1': 1 }]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.checks.database).toBe('ok');
    expect(data.checks.server).toBe('ok');
    expect(data.timestamp).toBeDefined();
  });

  it('should return unhealthy status when database fails', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('Database connection failed'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe('unhealthy');
    expect(data.checks.database).toBe('error');
    expect(data.checks.server).toBe('ok');
    expect(data.error).toBe('Database connection failed');
  });
});
