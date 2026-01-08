/**
 * Mock data generator for Business KPI Dashboard
 * Deterministic seeded random data for realistic portfolio demo
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

export type OrderStatus = 'Paid' | 'Pending' | 'Refunded';
export type OrderCategory = 'Subscriptions' | 'Services' | 'Add-ons' | 'Other';
export type Region = 'NA' | 'EU' | 'APAC';
export type TrafficSource = 'Organic' | 'Paid' | 'Referral' | 'Email';

export interface Order {
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

export interface DashboardFilters {
  dateRange: 'Last 7 days' | 'Last 30 days' | 'Last 90 days';
  segment: 'All' | 'New customers' | 'Returning customers';
  region: 'All' | 'NA' | 'EU' | 'APAC';
}

export interface KPIData {
  revenue: {
    value: number;
    change: number;
  };
  orders: {
    value: number;
    change: number;
  };
  conversionRate: {
    value: number;
    change: number;
  };
  avgOrderValue: {
    value: number;
    change: number;
  };
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface CategoryDataPoint {
  category: OrderCategory;
  orders: number;
}

export interface TrafficSourceDataPoint {
  source: TrafficSource;
  value: number;
}

export interface DashboardData {
  kpis: KPIData;
  revenueOverTime: RevenueDataPoint[];
  ordersByCategory: CategoryDataPoint[];
  trafficSources: TrafficSourceDataPoint[];
  orders: Order[];
}

// Generate 500 orders over the last 90 days
const generateOrders = (): Order[] => {
  const rng = new SeededRandom(42);
  const orders: Order[] = [];
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const firstNames = [
    'Emma',
    'Liam',
    'Olivia',
    'Noah',
    'Ava',
    'Ethan',
    'Sophia',
    'Mason',
    'Isabella',
    'William',
    'Mia',
    'James',
    'Charlotte',
    'Benjamin',
    'Amelia',
    'Lucas',
    'Harper',
    'Henry',
    'Evelyn',
    'Alexander',
    'Abigail',
    'Michael',
    'Emily',
    'Daniel',
    'Elizabeth',
    'Matthew',
    'Sofia',
    'Jackson',
    'Avery',
    'David',
    'Ella',
    'Joseph',
    'Scarlett',
    'Samuel',
    'Grace',
    'Sebastian',
  ];

  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
    'Davis',
    'Rodriguez',
    'Martinez',
    'Hernandez',
    'Lopez',
    'Gonzalez',
    'Wilson',
    'Anderson',
    'Thomas',
    'Taylor',
    'Moore',
    'Jackson',
    'Martin',
    'Lee',
    'Perez',
    'Thompson',
    'White',
    'Harris',
    'Sanchez',
    'Clark',
    'Ramirez',
    'Lewis',
    'Robinson',
    'Walker',
    'Young',
    'Allen',
    'King',
  ];

  const statuses: OrderStatus[] = ['Paid', 'Paid', 'Paid', 'Paid', 'Paid', 'Pending', 'Refunded'];
  const categories: OrderCategory[] = ['Subscriptions', 'Services', 'Add-ons', 'Other'];
  const regions: Region[] = ['NA', 'EU', 'APAC'];
  const sources: TrafficSource[] = ['Organic', 'Paid', 'Referral', 'Email'];

  // Generate 2000 orders over 90 days for more realistic mid-size company volume
  for (let i = 0; i < 2000; i++) {
    const daysAgo = rng.nextInt(0, 89);
    const date = new Date(now.getTime() - daysAgo * dayMs);

    const firstName = rng.pick(firstNames);
    const lastName = rng.pick(lastNames);

    orders.push({
      id: `ORD-${10000 + i}`,
      customerName: `${firstName} ${lastName}`,
      date,
      status: rng.pick(statuses),
      category: rng.pick(categories),
      // Realistic B2B/SaaS pricing: $800-$4500 per order
      total: rng.nextFloat(800, 4500),
      region: rng.pick(regions),
      trafficSource: rng.pick(sources),
      isReturningCustomer: rng.next() > 0.6,
    });
  }

  return orders.sort((a, b) => b.date.getTime() - a.date.getTime());
};

// Cache the orders so they don't regenerate on every call
const ALL_ORDERS = generateOrders();

const filterOrders = (orders: Order[], filters: DashboardFilters): Order[] => {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  let daysBack = 90;
  if (filters.dateRange === 'Last 7 days') daysBack = 7;
  if (filters.dateRange === 'Last 30 days') daysBack = 30;

  const cutoffDate = new Date(now.getTime() - daysBack * dayMs);

  return orders.filter((order) => {
    const dateMatch = order.date >= cutoffDate;
    const segmentMatch =
      filters.segment === 'All' ||
      (filters.segment === 'New customers' && !order.isReturningCustomer) ||
      (filters.segment === 'Returning customers' && order.isReturningCustomer);
    const regionMatch = filters.region === 'All' || order.region === filters.region;

    return dateMatch && segmentMatch && regionMatch;
  });
};

const calculateKPIs = (currentOrders: Order[], previousOrders: Order[], growthMultiplier = 1.0): KPIData => {
  const currentRevenue = currentOrders.filter((o) => o.status === 'Paid').reduce((sum, o) => sum + o.total, 0);

  const previousRevenue = previousOrders.filter((o) => o.status === 'Paid').reduce((sum, o) => sum + o.total, 0);

  const currentOrderCount = currentOrders.filter((o) => o.status === 'Paid').length;
  const previousOrderCount = previousOrders.filter((o) => o.status === 'Paid').length;

  const currentAvgOrder = currentOrderCount > 0 ? currentRevenue / currentOrderCount : 0;
  const previousAvgOrder = previousOrderCount > 0 ? previousRevenue / previousOrderCount : 0;

  // Mock conversion rate (orders / visitors assumption)
  const currentConversion = currentOrderCount > 0 ? 2.4 : 0;
  const previousConversion = previousOrderCount > 0 ? 2.1 : 0;

  // Apply growth multiplier to current values to show optimistic trends
  const adjustedRevenue = currentRevenue * growthMultiplier;
  const adjustedOrderCount = currentOrderCount * growthMultiplier;
  const adjustedAvgOrder = currentAvgOrder * growthMultiplier;
  const adjustedConversion = currentConversion * growthMultiplier;

  return {
    revenue: {
      value: currentRevenue,
      change: previousRevenue > 0 ? ((adjustedRevenue - previousRevenue) / previousRevenue) * 100 : 0,
    },
    orders: {
      value: currentOrderCount,
      change: previousOrderCount > 0 ? ((adjustedOrderCount - previousOrderCount) / previousOrderCount) * 100 : 0,
    },
    conversionRate: {
      value: currentConversion,
      change: previousConversion > 0 ? ((adjustedConversion - previousConversion) / previousConversion) * 100 : 0,
    },
    avgOrderValue: {
      value: currentAvgOrder,
      change: previousAvgOrder > 0 ? ((adjustedAvgOrder - previousAvgOrder) / previousAvgOrder) * 100 : 0,
    },
  };
};

const getRevenueOverTime = (orders: Order[]): RevenueDataPoint[] => {
  const dailyRevenue = new Map<string, number>();

  orders
    .filter((o) => o.status === 'Paid')
    .forEach((order) => {
      const dateKey = order.date.toISOString().split('T')[0];
      dailyRevenue.set(dateKey, (dailyRevenue.get(dateKey) || 0) + order.total);
    });

  return Array.from(dailyRevenue.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

const getOrdersByCategory = (orders: Order[]): CategoryDataPoint[] => {
  const categories = new Map<OrderCategory, number>();

  orders
    .filter((o) => o.status === 'Paid')
    .forEach((order) => {
      categories.set(order.category, (categories.get(order.category) || 0) + 1);
    });

  const allCategories: OrderCategory[] = ['Subscriptions', 'Services', 'Add-ons', 'Other'];
  return allCategories.map((category) => ({
    category,
    orders: categories.get(category) || 0,
  }));
};

const getTrafficSources = (orders: Order[]): TrafficSourceDataPoint[] => {
  const sources = new Map<TrafficSource, number>();

  // Only count paid orders to match the KPI metrics
  orders
    .filter((o) => o.status === 'Paid')
    .forEach((order) => {
      sources.set(order.trafficSource, (sources.get(order.trafficSource) || 0) + 1);
    });

  return Array.from(sources.entries()).map(([source, value]) => ({ source, value }));
};

export const getDashboardData = (filters: DashboardFilters): DashboardData => {
  const filteredOrders = filterOrders(ALL_ORDERS, filters);

  // Calculate previous period for comparison
  let daysBack = 90;
  if (filters.dateRange === 'Last 7 days') daysBack = 7;
  if (filters.dateRange === 'Last 30 days') daysBack = 30;

  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;
  const previousCutoff = new Date(now.getTime() - 2 * daysBack * dayMs);
  const currentCutoff = new Date(now.getTime() - daysBack * dayMs);

  const previousOrders = ALL_ORDERS.filter((o) => o.date >= previousCutoff && o.date < currentCutoff);

  // Apply growth bias for 30/90 day views to show optimistic trends
  const growthMultiplier = filters.dateRange === 'Last 7 days' ? 1.0 : 1.15;

  return {
    kpis: calculateKPIs(filteredOrders, previousOrders, growthMultiplier),
    revenueOverTime: getRevenueOverTime(filteredOrders),
    ordersByCategory: getOrdersByCategory(filteredOrders),
    trafficSources: getTrafficSources(filteredOrders),
    orders: filteredOrders,
  };
};

export const exportOrdersToCSV = (orders: Order[]): void => {
  const headers = ['Order ID', 'Customer', 'Date', 'Status', 'Category', 'Total', 'Region', 'Traffic Source'];
  const rows = orders.map((order) => [
    order.id,
    order.customerName,
    order.date.toLocaleDateString(),
    order.status,
    order.category,
    order.total.toFixed(2),
    order.region,
    order.trafficSource,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
