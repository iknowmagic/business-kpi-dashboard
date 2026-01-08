import { describe, expect, it } from 'vitest';
import handler from '../../api/dashboard';

type ApiOrder = {
  region: string;
  isReturningCustomer: boolean;
};

type JsonBody = {
  orders?: ApiOrder[];
  kpis?: {
    revenue?: { value: number };
  };
};

interface MockRes {
  statusCode: number;
  body: JsonBody | null;
  headers: Record<string, string>;
  status: (code: number) => MockRes;
  json: (data: JsonBody) => MockRes;
  setHeader: (key: string, value: string) => void;
  end: () => void;
}

function createMockRes(): MockRes {
  const res: MockRes = {
    statusCode: 200,
    body: null,
    headers: {},
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: JsonBody) {
      this.body = data;
      return this;
    },
    setHeader(key: string, value: string) {
      this.headers[key] = value;
    },
    end() {
      return this;
    },
  };

  return res;
}

function runHandler(query: Record<string, string | undefined>) {
  const req = {
    method: 'GET',
    query,
  } as unknown as import('@vercel/node').VercelRequest;

  const res = createMockRes();
  handler(req, res as unknown as import('@vercel/node').VercelResponse);
  return res;
}

describe('dashboard API', () => {
  it('returns data with defaults', () => {
    const res = runHandler({});

    expect(res.statusCode).toBe(200);
    expect(res.body).not.toBeNull();
    expect(Array.isArray(res.body?.orders)).toBe(true);
    const orders = (res.body?.orders ?? []) as ApiOrder[];
    expect(orders.length).toBeGreaterThan(0);
    expect(res.body?.kpis?.revenue?.value).toBeGreaterThan(0);
  });

  it('respects filters', () => {
    const res = runHandler({ dateRange: 'Last 7 days', segment: 'New customers', region: 'EU' });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body?.orders)).toBe(true);

    const orders = (res.body?.orders ?? []) as ApiOrder[];
    const allMatchSegment = orders.every((o) => o.isReturningCustomer === false);
    const allMatchRegion = orders.every((o) => o.region === 'EU');

    expect(allMatchSegment).toBe(true);
    expect(allMatchRegion).toBe(true);
  });
});
