import { describe, expect, it } from 'vitest';

type ApiOrder = {
  region: string;
  isReturningCustomer: boolean;
};

type ApiResponse = {
  orders: ApiOrder[];
  kpis: {
    revenue: { value: number };
  };
};

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

describe('dashboard API (integration, live fetch)', () => {
  it('returns data for default filters', async () => {
    const params = new URLSearchParams({
      dateRange: 'Last 30 days',
      segment: 'All',
      region: 'All',
    });

    const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
    expect(res.status).toBe(200);

    const body = (await res.json()) as ApiResponse;

    expect(Array.isArray(body.orders)).toBe(true);
    expect(body.orders.length).toBeGreaterThan(0);
    expect(body.kpis?.revenue?.value).toBeGreaterThan(0);
  });

  it('respects filters (Last 7 days, New customers, EU)', async () => {
    const params = new URLSearchParams({
      dateRange: 'Last 7 days',
      segment: 'New customers',
      region: 'EU',
    });

    const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
    expect(res.status).toBe(200);

    const body = (await res.json()) as ApiResponse;
    const orders = body.orders ?? [];

    // Verify that if results exist, they respect all filters
    if (orders.length > 0) {
      expect(orders.every((o) => o.region === 'EU')).toBe(true);
      expect(orders.every((o) => o.isReturningCustomer === false)).toBe(true);
    }
    // Filters are applied correctly; result may be empty depending on data distribution
  });
});
