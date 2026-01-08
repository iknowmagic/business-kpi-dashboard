/**
 * Customers Page
 * Full-page view of customer data derived from orders
 */

import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dashboardQueryOptions } from '@/lib/dashboardApi';
import { filtersAtom } from '@/store/dashboard/atoms';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

interface CustomerData {
  name: string;
  totalOrders: number;
  totalSpent: number;
  isReturning: boolean;
  region: string;
}

export default function CustomersPage() {
  const filters = useAtomValue(filtersAtom);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery(dashboardQueryOptions(filters));

  const customersData = useMemo(() => {
    const orders = data?.orders ?? [];
    const customerMap = new Map<string, CustomerData>();

    orders
      .filter((o) => o.status === 'Paid')
      .forEach((order) => {
        const existing = customerMap.get(order.customerName);
        if (existing) {
          existing.totalOrders += 1;
          existing.totalSpent += order.total;
        } else {
          customerMap.set(order.customerName, {
            name: order.customerName,
            totalOrders: 1,
            totalSpent: order.total,
            isReturning: order.isReturningCustomer,
            region: order.region,
          });
        }
      });

    return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [data?.orders]);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customersData;
    const query = searchQuery.toLowerCase();
    return customersData.filter((customer) => customer.name.toLowerCase().includes(query));
  }, [customersData, searchQuery]);

  return (
    <div className="bg-background flex min-h-screen flex-col md:flex-row">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader title="Customers" showFilters={true} showExport={false} />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {isLoading ? (
            <div className="bg-card rounded-lg border p-4 md:p-6" data-testid="customers-table-skeleton">
              <Skeleton className="mb-4 h-6 w-40" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : customersData.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="bg-card rounded-lg border p-4 md:p-6" data-testid="customers-table">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h3 className="text-lg font-semibold">All Customers</h3>
                <div className="relative w-full md:w-64">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                  <Input
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="customers-search"
                  />
                </div>
              </div>

              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer Name</TableHead>
                      <TableHead>Total Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Region</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                          No customers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <TableRow key={customer.name} data-testid="customer-row">
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.totalOrders}</TableCell>
                          <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={customer.isReturning ? 'default' : 'secondary'}>
                              {customer.isReturning ? 'Returning' : 'New'}
                            </Badge>
                          </TableCell>
                          <TableCell>{customer.region}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
