/**
 * Ultra-simple dashboard API
 * Reuses the existing mock data generator and returns JSON.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { DashboardFilters } from '../src/lib/mockData.js';
import { getDashboardData } from '../src/lib/mockData.js';

// Helpers to robustly decode query params (handle + and %20)
const decodeParam = (value: unknown): string | undefined => {
  const v = Array.isArray(value) ? value[0] : value;
  if (typeof v !== 'string') return undefined;
  const replaced = v.replace(/\+/g, ' ');
  try {
    return decodeURIComponent(replaced);
  } catch {
    return replaced;
  }
};

const DATE_RANGES = new Set<DashboardFilters['dateRange']>(['Last 7 days', 'Last 30 days', 'Last 90 days']);
const SEGMENTS = new Set<DashboardFilters['segment']>(['All', 'New customers', 'Returning customers']);
const REGIONS = new Set<DashboardFilters['region']>(['All', 'NA', 'EU', 'APAC']);

const coerceDateRange = (v: unknown): DashboardFilters['dateRange'] => {
  const s = decodeParam(v);
  return s && DATE_RANGES.has(s as DashboardFilters['dateRange'])
    ? (s as DashboardFilters['dateRange'])
    : 'Last 30 days';
};

const coerceSegment = (v: unknown): DashboardFilters['segment'] => {
  const s = decodeParam(v);
  return s && SEGMENTS.has(s as DashboardFilters['segment']) ? (s as DashboardFilters['segment']) : 'All';
};

const coerceRegion = (v: unknown): DashboardFilters['region'] => {
  const s = decodeParam(v);
  return s && REGIONS.has(s as DashboardFilters['region']) ? (s as DashboardFilters['region']) : 'All';
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filters: DashboardFilters = {
      dateRange: coerceDateRange(req.query.dateRange),
      segment: coerceSegment(req.query.segment),
      region: coerceRegion(req.query.region),
    };

    const data = getDashboardData(filters);

    return res.status(200).json({
      ...data,
      orders: data.orders.map((order) => ({
        ...order,
        date: order.date.toISOString(),
      })),
    });
  } catch (_error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
