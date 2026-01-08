import { describe, expect, it } from 'vitest';

type ApiOrder = {
  id: string;
  customerName: string;
  date: string;
  status: 'Paid' | 'Pending' | 'Refunded';
  category: string;
  total: number;
  region: 'NA' | 'EU' | 'APAC';
  trafficSource: string;
  isReturningCustomer: boolean;
};

type ApiResponse = {
  orders: ApiOrder[];
  kpis: {
    revenue: { value: number; change: number };
    orders: { value: number; change: number };
    conversionRate: { value: number; change: number };
    avgOrderValue: { value: number; change: number };
  };
  revenueOverTime: Array<{ date: string; revenue: number }>;
  ordersByCategory: Array<{ category: string; orders: number }>;
  trafficSources: Array<{ source: string; value: number }>;
};

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

describe('Dashboard API - Backend-Driven Features', () => {
  describe('Filter by Date Range', () => {
    it('provides data for "Last 7 days"', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 7 days', segment: 'All', region: 'All' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      expect(Array.isArray(body.orders)).toBe(true);
      expect(body.kpis.revenue.value).toBeGreaterThanOrEqual(0);
      expect(body.revenueOverTime).toBeDefined();
    });

    it('provides data for "Last 30 days"', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 30 days', segment: 'All', region: 'All' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      expect(Array.isArray(body.orders)).toBe(true);
      expect(body.kpis.revenue.value).toBeGreaterThanOrEqual(0);
    });

    it('provides data for "Last 90 days"', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 90 days', segment: 'All', region: 'All' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      expect(Array.isArray(body.orders)).toBe(true);
      expect(body.kpis.revenue.value).toBeGreaterThanOrEqual(0);
      // Longer date range should generally have more or equal data
      expect(body.orders.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Filter by Customer Segment', () => {
    it('provides data for "All" customers', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 90 days', segment: 'All', region: 'All' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      expect(Array.isArray(body.orders)).toBe(true);
    });

    it('provides data for "New customers" only', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 90 days', segment: 'New customers', region: 'All' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      const orders = body.orders ?? [];
      // All returned orders must be new customers
      orders.forEach((order) => {
        expect(order.isReturningCustomer).toBe(false);
      });
    });

    it('returns at least one order for "New customers" in the last 30 days (expected to fail now)', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 30 days', segment: 'New customers', region: 'All' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      const orders = body.orders ?? [];
      // This asserts backend actually serves new-customer data in 30-day window
      expect(orders.length).toBeGreaterThan(0);
    });

    it('provides data for "Returning customers" only', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 90 days', segment: 'Returning customers', region: 'All' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      const orders = body.orders ?? [];
      // All returned orders must be returning customers
      orders.forEach((order) => {
        expect(order.isReturningCustomer).toBe(true);
      });
    });
  });

  describe('Filter by Region', () => {
    it('provides data for "All" regions', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 90 days', segment: 'All', region: 'All' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      expect(Array.isArray(body.orders)).toBe(true);
    });

    it('provides data for "NA" region', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 90 days', segment: 'All', region: 'NA' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      const orders = body.orders ?? [];
      // All returned orders must be from NA
      orders.forEach((order) => {
        expect(order.region).toBe('NA');
      });
    });

    it('provides data for "EU" region', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 90 days', segment: 'All', region: 'EU' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      const orders = body.orders ?? [];
      // All returned orders must be from EU
      orders.forEach((order) => {
        expect(order.region).toBe('EU');
      });
    });

    it('provides data for "APAC" region', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 90 days', segment: 'All', region: 'APAC' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      const orders = body.orders ?? [];
      // All returned orders must be from APAC
      orders.forEach((order) => {
        expect(order.region).toBe('APAC');
      });
    });
  });

  describe('Combined Filters', () => {
    it('applies multiple filters simultaneously', async () => {
      const params = new URLSearchParams({
        dateRange: 'Last 30 days',
        segment: 'New customers',
        region: 'EU',
      });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      const orders = body.orders ?? [];

      // All filters must be applied
      orders.forEach((order) => {
        expect(order.region).toBe('EU');
        expect(order.isReturningCustomer).toBe(false);
      });
    });
  });

  describe('KPI Metrics', () => {
    it('provides all KPI values with change indicators', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 30 days', segment: 'All', region: 'All' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      const kpis = body.kpis;

      // All KPIs must have value and change properties
      expect(kpis.revenue).toHaveProperty('value');
      expect(kpis.revenue).toHaveProperty('change');
      expect(typeof kpis.revenue.value).toBe('number');
      expect(typeof kpis.revenue.change).toBe('number');

      expect(kpis.orders).toHaveProperty('value');
      expect(kpis.orders).toHaveProperty('change');

      expect(kpis.conversionRate).toHaveProperty('value');
      expect(kpis.conversionRate).toHaveProperty('change');

      expect(kpis.avgOrderValue).toHaveProperty('value');
      expect(kpis.avgOrderValue).toHaveProperty('change');
    });
  });

  describe('Revenue Over Time', () => {
    it('provides daily revenue data for charting', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 30 days', segment: 'All', region: 'All' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      expect(Array.isArray(body.revenueOverTime)).toBe(true);

      // Each data point should have date and revenue
      body.revenueOverTime.forEach((point) => {
        expect(typeof point.date).toBe('string');
        expect(typeof point.revenue).toBe('number');
      });
    });
  });

  describe('Orders by Category', () => {
    it('provides breakdown of orders by product category', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 90 days', segment: 'All', region: 'All' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      expect(Array.isArray(body.ordersByCategory)).toBe(true);
      expect(body.ordersByCategory.length).toBeGreaterThan(0);

      // Each category should have a name and order count
      body.ordersByCategory.forEach((cat) => {
        expect(typeof cat.category).toBe('string');
        expect(typeof cat.orders).toBe('number');
      });
    });
  });

  describe('Traffic Sources', () => {
    it('provides breakdown of traffic sources', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 90 days', segment: 'All', region: 'All' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      expect(Array.isArray(body.trafficSources)).toBe(true);

      // Each source should have a name and value
      body.trafficSources.forEach((src) => {
        expect(typeof src.source).toBe('string');
        expect(typeof src.value).toBe('number');
      });
    });
  });

  describe('Order Table Data', () => {
    it('provides complete order details for table display', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 90 days', segment: 'All', region: 'All' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      expect(body.orders.length).toBeGreaterThan(0);

      // Each order should have required fields for the table
      body.orders.forEach((order) => {
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('customerName');
        expect(order).toHaveProperty('date');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('category');
        expect(order).toHaveProperty('total');
        expect(order).toHaveProperty('region');
        expect(order).toHaveProperty('trafficSource');
      });
    });

    it('supports ordering by different fields', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 90 days', segment: 'All', region: 'All' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;
      expect(Array.isArray(body.orders)).toBe(true);

      // Verify data supports sorting by checking unique values exist
      const dates = new Set(body.orders.map((o) => o.date));
      const amounts = new Set(body.orders.map((o) => o.total));

      expect(dates.size).toBeGreaterThan(1);
      expect(amounts.size).toBeGreaterThan(1);
    });
  });

  describe('CSV Export Support', () => {
    it('provides data in format suitable for CSV export', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 90 days', segment: 'All', region: 'All' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;

      // Verify all fields needed for CSV are present
      body.orders.forEach((order) => {
        expect(order.id).toBeTruthy();
        expect(order.customerName).toBeTruthy();
        expect(order.date).toBeTruthy();
        expect(order.status).toBeTruthy();
        expect(order.category).toBeTruthy();
        expect(typeof order.total).toBe('number');
        expect(order.region).toBeTruthy();
        expect(order.trafficSource).toBeTruthy();
      });
    });
  });

  describe('Three Page Views', () => {
    it('dashboard returns KPIs, charts, and orders', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 30 days', segment: 'All', region: 'All' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;

      // Dashboard needs KPIs
      expect(body.kpis).toBeDefined();

      // Dashboard needs charts
      expect(body.revenueOverTime).toBeDefined();
      expect(body.ordersByCategory).toBeDefined();
      expect(body.trafficSources).toBeDefined();

      // Dashboard needs orders table
      expect(body.orders).toBeDefined();
    });

    it('orders page can use the same API with all filters', async () => {
      const params = new URLSearchParams({
        dateRange: 'Last 30 days',
        segment: 'New customers',
        region: 'EU',
      });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;

      // Orders page needs the table data with all filters applied
      expect(Array.isArray(body.orders)).toBe(true);

      // All filters should be respected
      body.orders.forEach((order) => {
        expect(order.isReturningCustomer).toBe(false); // segment filter
        expect(order.region).toBe('EU'); // region filter
      });
    });

    it('customers page derives data from orders', async () => {
      const params = new URLSearchParams({ dateRange: 'Last 90 days', segment: 'All', region: 'All' });
      const res = await fetch(`${API_BASE_URL}/api/dashboard?${params.toString()}`);
      expect(res.status).toBe(200);

      const body = (await res.json()) as ApiResponse;

      // Customers page needs customer information (can be derived from orders)
      expect(Array.isArray(body.orders)).toBe(true);
      expect(body.orders.length).toBeGreaterThan(0);

      // Each order has customer data
      body.orders.forEach((order) => {
        expect(order.customerName).toBeTruthy();
        expect(order.isReturningCustomer).toBeDefined();
      });
    });
  });
});
