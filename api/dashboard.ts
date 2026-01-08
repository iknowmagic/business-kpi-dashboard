/**
 * Vercel Serverless Function: Dashboard Data API
 * Returns aggregated dashboard data based on filters
 */

// Seeded random number generator for deterministic output
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}

type OrderStatus = 'Paid' | 'Pending' | 'Refunded';
type OrderCategory = 'Subscriptions' | 'Services' | 'Add-ons' | 'Other';
type Region = 'NA' | 'EU' | 'APAC';
type TrafficSource = 'Organic' | 'Paid' | 'Referral' | 'Email';

interface Order {
  id: string;
  customerName: string;
  date: Date;
  status: OrderStatus;
  category: OrderCategory;
  total: number;
  region: Region;
  trafficSource: TrafficSource;
  isReturningCustomer: boolean;
}

interface DashboardFilters {
  dateRange: 'Last 7 days' | 'Last 30 days' | 'Last 90 days';
  segment: 'All' | 'New customers' | 'Returning customers';
  region: 'All' | Region;
}

// Generate 500 deterministic orders
function generateOrders(): Order[] {
  const rng = new SeededRandom(42);
  const orders: Order[] = [];
  const now = new Date();
  const customers = Array.from({ length: 150 }, (_, i) => `Customer ${i + 1}`);

  const statuses: OrderStatus[] = ['Paid', 'Pending', 'Refunded'];
  const categories: OrderCategory[] = ['Subscriptions', 'Services', 'Add-ons', 'Other'];
  const regions: Region[] = ['NA', 'EU', 'APAC'];
  const sources: TrafficSource[] = ['Organic', 'Paid', 'Referral', 'Email'];

  for (let i = 0; i < 500; i++) {
    const daysAgo = rng.nextInt(0, 89);
    const orderDate = new Date(now);
    orderDate.setDate(orderDate.getDate() - daysAgo);

    orders.push({
      id: `ORD-${String(i + 1).padStart(4, '0')}`,
      customerName: rng.pick(customers),
      date: orderDate,
      status: rng.pick(statuses),
      category: rng.pick(categories),
      total: rng.nextFloat(10, 500),
      region: rng.pick(regions),
      trafficSource: rng.pick(sources),
      isReturningCustomer: rng.next() > 0.6,
    });
  }

  return orders.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Apply filters to orders
function applyFilters(orders: Order[], filters: DashboardFilters): Order[] {
  let filtered = [...orders];

  // Date range filter
  const now = new Date();
  const daysMap = {
    'Last 7 days': 7,
    'Last 30 days': 30,
    'Last 90 days': 90,
  };
  const cutoffDate = new Date(now);
  cutoffDate.setDate(cutoffDate.getDate() - daysMap[filters.dateRange]);
  filtered = filtered.filter((order) => order.date >= cutoffDate);

  // Segment filter
  if (filters.segment === 'New customers') {
    filtered = filtered.filter((order) => !order.isReturningCustomer);
  } else if (filters.segment === 'Returning customers') {
    filtered = filtered.filter((order) => order.isReturningCustomer);
  }

  // Region filter
  if (filters.region !== 'All') {
    filtered = filtered.filter((order) => order.region === filters.region);
  }

  return filtered;
}

// Calculate KPIs with comparison to previous period
function calculateKPIs(currentOrders: Order[], previousOrders: Order[]) {
  const calcMetrics = (orders: Order[]) => {
    const revenue = orders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = orders.length;
    const conversionRate = orderCount > 0 ? (orderCount / (orderCount * 1.5)) * 100 : 0;
    const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;
    return { revenue, orderCount, conversionRate, avgOrderValue };
  };

  const current = calcMetrics(currentOrders);
  const previous = calcMetrics(previousOrders);

  const calcChange = (curr: number, prev: number) => (prev > 0 ? ((curr - prev) / prev) * 100 : 0);

  return {
    revenue: { value: current.revenue, change: calcChange(current.revenue, previous.revenue) },
    orders: { value: current.orderCount, change: calcChange(current.orderCount, previous.orderCount) },
    conversionRate: {
      value: current.conversionRate,
      change: calcChange(current.conversionRate, previous.conversionRate),
    },
    avgOrderValue: { value: current.avgOrderValue, change: calcChange(current.avgOrderValue, previous.avgOrderValue) },
  };
}

// Aggregate data for charts
function aggregateChartData(orders: Order[]) {
  // Revenue over time (daily)
  const revenueByDate = orders.reduce(
    (acc, order) => {
      const dateKey = order.date.toISOString().split('T')[0];
      acc[dateKey] = (acc[dateKey] || 0) + order.total;
      return acc;
    },
    {} as Record<string, number>
  );

  const revenueOverTime = Object.entries(revenueByDate)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Orders by category
  const ordersByCategory = orders.reduce(
    (acc, order) => {
      acc[order.category] = (acc[order.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const categoryData = Object.entries(ordersByCategory).map(([category, orders]) => ({
    category,
    orders,
  }));

  // Traffic sources
  const trafficBySource = orders.reduce(
    (acc, order) => {
      acc[order.trafficSource] = (acc[order.trafficSource] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const trafficSources = Object.entries(trafficBySource).map(([source, value]) => ({
    source,
    value,
  }));

  return { revenueOverTime, ordersByCategory: categoryData, trafficSources };
}

export default function handler(req: Request): Response {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Parse query parameters from URL
    const url = new URL(req.url);
    const dateRange = url.searchParams.get('dateRange') || 'Last 30 days';
    const segment = url.searchParams.get('segment') || 'All';
    const region = url.searchParams.get('region') || 'All';

    const filters: DashboardFilters = {
      dateRange: dateRange as DashboardFilters['dateRange'],
      segment: segment as DashboardFilters['segment'],
      region: region as DashboardFilters['region'],
    };

    // Generate all orders once
    const allOrders = generateOrders();

    // Get current period orders
    const currentOrders = applyFilters(allOrders, filters);

    // Get previous period orders for comparison
    const daysMap = { 'Last 7 days': 7, 'Last 30 days': 30, 'Last 90 days': 90 };
    const days = daysMap[filters.dateRange];
    const now = new Date();
    const previousStart = new Date(now);
    previousStart.setDate(previousStart.getDate() - days * 2);
    const previousEnd = new Date(now);
    previousEnd.setDate(previousEnd.getDate() - days);

    const previousOrders = allOrders.filter((order) => order.date >= previousStart && order.date < previousEnd);

    // Calculate KPIs and aggregations
    const kpis = calculateKPIs(currentOrders, previousOrders);
    const chartData = aggregateChartData(currentOrders);

    // Return complete dashboard data
    return new Response(
      JSON.stringify({
        kpis,
        revenueOverTime: chartData.revenueOverTime,
        ordersByCategory: chartData.ordersByCategory,
        trafficSources: chartData.trafficSources,
        orders: currentOrders.map((order) => ({
          ...order,
          date: order.date.toISOString(),
        })),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Dashboard API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
