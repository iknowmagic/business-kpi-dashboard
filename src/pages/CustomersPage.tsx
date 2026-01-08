/**
 * Customers Page
 * Full-page view of customer data derived from orders
 */

import { AppSidebar } from '@/components/dashboard/AppSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dashboardQueryOptions } from '@/lib/dashboardApi';
import { filtersAtom } from '@/store/dashboard/atoms';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface CustomerData {
  name: string;
  totalOrders: number;
  totalSpent: number;
  isReturning: boolean;
  region: string;
}

const ITEMS_PER_PAGE = 10;

type SortField = 'name' | 'totalOrders' | 'totalSpent' | 'region';

export default function CustomersPage() {
  const filters = useAtomValue(filtersAtom);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('totalSpent');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery(dashboardQueryOptions(filters));

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

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

    return Array.from(customerMap.values());
  }, [data?.orders]);

  const filteredAndSorted = useMemo(() => {
    let result = [...customersData];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((customer) => customer.name.toLowerCase().includes(query));
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'totalOrders':
          comparison = a.totalOrders - b.totalOrders;
          break;
        case 'totalSpent':
          comparison = a.totalSpent - b.totalSpent;
          break;
        case 'region':
          comparison = a.region.localeCompare(b.region);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [customersData, searchQuery, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginatedCustomers = filteredAndSorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
                      <TableHead
                        className="cursor-pointer select-none hover:bg-muted/50"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Customer Name
                          {sortField === 'name' &&
                            (sortDirection === 'asc' ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none hover:bg-muted/50"
                        onClick={() => handleSort('totalOrders')}
                      >
                        <div className="flex items-center gap-1">
                          Total Orders
                          {sortField === 'totalOrders' &&
                            (sortDirection === 'asc' ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer select-none hover:bg-muted/50"
                        onClick={() => handleSort('totalSpent')}
                      >
                        <div className="flex items-center gap-1">
                          Total Spent
                          {sortField === 'totalSpent' &&
                            (sortDirection === 'asc' ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead
                        className="cursor-pointer select-none hover:bg-muted/50"
                        onClick={() => handleSort('region')}
                      >
                        <div className="flex items-center gap-1">
                          Region
                          {sortField === 'region' &&
                            (sortDirection === 'asc' ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            ))}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCustomers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-muted-foreground py-8 text-center">
                          No customers found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedCustomers.map((customer) => {
                        const formatNumber = (num: number): string => {
                          if (num >= 1000000) return '$' + (num / 1000000).toFixed(1) + 'M';
                          if (num >= 1000) return '$' + (num / 1000).toFixed(1) + 'K';
                          return '$' + num.toFixed(0);
                        };

                        return (
                          <TableRow key={customer.name} data-testid="customer-row">
                            <TableCell className="font-medium">{customer.name}</TableCell>
                            <TableCell>{customer.totalOrders}</TableCell>
                            <TableCell>{formatNumber(customer.totalSpent)}</TableCell>
                            <TableCell>
                              <Badge variant={customer.isReturning ? 'default' : 'secondary'}>
                                {customer.isReturning ? 'Returning' : 'New'}
                              </Badge>
                            </TableCell>
                            <TableCell>{customer.region}</TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredAndSorted.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSorted.length)} of {filteredAndSorted.length}{' '}
                  customers
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
