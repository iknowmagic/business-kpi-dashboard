/**
 * Ultra-simple dashboard API
 * Reuses the existing mock data generator and returns JSON.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { DashboardFilters } from '../src/lib/mockData.js';
import { getDashboardData } from '../src/lib/mockData.js';

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
    const dateRangeParam = Array.isArray(req.query.dateRange) ? req.query.dateRange[0] : req.query.dateRange;
    const segmentParam = Array.isArray(req.query.segment) ? req.query.segment[0] : req.query.segment;
    const regionParam = Array.isArray(req.query.region) ? req.query.region[0] : req.query.region;

    const filters: DashboardFilters = {
      dateRange: (dateRangeParam as DashboardFilters['dateRange']) || 'Last 30 days',
      segment: (segmentParam as DashboardFilters['segment']) || 'All',
      region: (regionParam as DashboardFilters['region']) || 'All',
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
