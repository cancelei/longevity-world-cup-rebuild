"use client";

import { useState, useCallback, useEffect, useRef } from "react";

/**
 * Pagination metadata from API
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Paginated API response format
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Filter state for data fetching
 */
export type FilterState = Record<string, string | number | boolean | undefined>;

/**
 * Options for usePaginatedData hook
 */
export interface UsePaginatedDataOptions<T, F extends FilterState = FilterState> {
  /** API endpoint to fetch from */
  endpoint: string;
  /** Initial page size */
  pageSize?: number;
  /** Initial filters */
  initialFilters?: F;
  /** Transform data after fetching */
  transform?: (data: T[]) => T[];
  /** Auto-fetch on mount */
  fetchOnMount?: boolean;
  /** Debounce delay for filter changes (ms) */
  debounceMs?: number;
}

/**
 * Return type for usePaginatedData hook
 */
export interface UsePaginatedDataReturn<T, F extends FilterState = FilterState> {
  /** Current data */
  data: T[];
  /** Loading state */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Current page (1-indexed) */
  page: number;
  /** Total number of items */
  totalCount: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there are more pages */
  hasMore: boolean;
  /** Current filters */
  filters: F;
  /** Set a single filter value */
  setFilter: <K extends keyof F>(key: K, value: F[K]) => void;
  /** Set multiple filters at once */
  setFilters: (filters: Partial<F>) => void;
  /** Reset all filters to initial values */
  resetFilters: () => void;
  /** Go to a specific page */
  goToPage: (page: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  prevPage: () => void;
  /** Refresh current page */
  refresh: () => void;
}

/**
 * Custom hook for paginated data fetching with filters
 *
 * Consolidates repeated pagination logic across components:
 * - athletes/page.tsx
 * - leagues/page.tsx
 * - leaderboard components
 *
 * @example
 * ```tsx
 * const {
 *   data: athletes,
 *   loading,
 *   page,
 *   totalPages,
 *   filters,
 *   setFilter,
 *   goToPage,
 * } = usePaginatedData<Athlete>({
 *   endpoint: '/api/athletes',
 *   pageSize: 20,
 *   initialFilters: { search: '', division: '' },
 * });
 * ```
 */
export function usePaginatedData<T, F extends FilterState = FilterState>(
  options: UsePaginatedDataOptions<T, F>
): UsePaginatedDataReturn<T, F> {
  const {
    endpoint,
    pageSize = 20,
    initialFilters = {} as F,
    transform,
    fetchOnMount = true,
    debounceMs = 300,
  } = options;

  // State
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFiltersState] = useState<F>(initialFilters);

  // Refs for debouncing and abort
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Build query string from filters
  const buildQueryString = useCallback(
    (currentPage: number, currentFilters: F): string => {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(pageSize));

      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== null) {
          params.set(key, String(value));
        }
      });

      return params.toString();
    },
    [pageSize]
  );

  // Fetch data
  const fetchData = useCallback(
    async (currentPage: number, currentFilters: F) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const queryString = buildQueryString(currentPage, currentFilters);
        const response = await fetch(`${endpoint}?${queryString}`, {
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const result: PaginatedResponse<T> = await response.json();

        const transformedData = transform ? transform(result.data) : result.data;
        setData(transformedData);
        setTotalCount(result.pagination.totalCount);
        setTotalPages(result.pagination.totalPages);
        setHasMore(result.pagination.hasMore);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return; // Ignore aborted requests
        }
        setError(err instanceof Error ? err.message : "An error occurred");
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, buildQueryString, transform]
  );

  // Debounced fetch for filter changes
  const debouncedFetch = useCallback(
    (currentPage: number, currentFilters: F) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        fetchData(currentPage, currentFilters);
      }, debounceMs);
    },
    [fetchData, debounceMs]
  );

  // Set a single filter
  const setFilter = useCallback(
    <K extends keyof F>(key: K, value: F[K]) => {
      setFiltersState((prev) => {
        const newFilters = { ...prev, [key]: value };
        setPage(1); // Reset to first page on filter change
        debouncedFetch(1, newFilters);
        return newFilters;
      });
    },
    [debouncedFetch]
  );

  // Set multiple filters
  const setFilters = useCallback(
    (newFilters: Partial<F>) => {
      setFiltersState((prev) => {
        const merged = { ...prev, ...newFilters };
        setPage(1);
        debouncedFetch(1, merged);
        return merged;
      });
    },
    [debouncedFetch]
  );

  // Reset filters
  const resetFilters = useCallback(() => {
    setFiltersState(initialFilters);
    setPage(1);
    fetchData(1, initialFilters);
  }, [initialFilters, fetchData]);

  // Page navigation
  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;
      setPage(newPage);
      fetchData(newPage, filters);
    },
    [totalPages, filters, fetchData]
  );

  const nextPage = useCallback(() => {
    if (hasMore) {
      goToPage(page + 1);
    }
  }, [hasMore, page, goToPage]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      goToPage(page - 1);
    }
  }, [page, goToPage]);

  // Refresh current page
  const refresh = useCallback(() => {
    fetchData(page, filters);
  }, [page, filters, fetchData]);

  // Initial fetch
  useEffect(() => {
    if (fetchOnMount) {
      fetchData(1, initialFilters);
    }

    return () => {
      // Cleanup on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    error,
    page,
    totalCount,
    totalPages,
    hasMore,
    filters,
    setFilter,
    setFilters,
    resetFilters,
    goToPage,
    nextPage,
    prevPage,
    refresh,
  };
}

/**
 * Hook for infinite scroll pagination
 */
export function useInfiniteData<T, F extends FilterState = FilterState>(
  options: UsePaginatedDataOptions<T, F>
): UsePaginatedDataReturn<T, F> & {
  loadMore: () => void;
  allData: T[];
} {
  const paginatedData = usePaginatedData<T, F>(options);
  const [allData, setAllData] = useState<T[]>([]);

  // Append new data when page changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (paginatedData.page === 1) {
        setAllData(paginatedData.data);
      } else {
        setAllData((prev) => [...prev, ...paginatedData.data]);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [paginatedData.data, paginatedData.page]);

  const loadMore = useCallback(() => {
    if (paginatedData.hasMore && !paginatedData.loading) {
      paginatedData.nextPage();
    }
  }, [paginatedData]);

  return {
    ...paginatedData,
    allData,
    loadMore,
  };
}
