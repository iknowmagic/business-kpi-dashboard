/**
 * Orders Table Component
 * Displays orders with search, sorting, pagination, and status badges
 */

import type { Order, OrderStatus } from '@/lib/mockData';
import { currentPageAtom, searchQueryAtom, sortDirectionAtom, sortFieldAtom } from '@/store/dashboard/atoms';
import { useAtom } from 'jotai';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Skeleton } from '../ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
}

const ITEMS_PER_PAGE = 10;

const statusColors: Record<OrderStatus, 'default' | 'secondary' | 'destructive'> = {
  Paid: 'default',
  Pending: 'secondary',
  Refunded: 'destructive',
};

export function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [sortField, setSortField] = useAtom(sortFieldAtom);
  const [sortDirection, setSortDirection] = useAtom(sortDirectionAtom);
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom);

  const handleSort = (field: 'id' | 'customerName' | 'date' | 'status' | 'category' | 'total' | 'region') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...orders];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) => order.id.toLowerCase().includes(query) || order.customerName.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'customerName':
          comparison = a.customerName.localeCompare(b.customerName);
          break;
        case 'date':
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'total':
          comparison = a.total - b.total;
          break;
        case 'region':
          comparison = a.region.localeCompare(b.region);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [orders, searchQuery, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredAndSorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (isLoading) {
    return (
      <div className="bg-card rounded-lg border p-6" data-testid="orders-table-skeleton">
        <Skeleton className="mb-4 h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-4 md:p-6" data-testid="orders-table">
      <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold">Orders</h3>
        <div className="relative w-full md:w-64">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
          <Input
            placeholder="Search by ID or customer..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
            data-testid="orders-search"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort('id')} data-testid="sort-id">
                <div className="flex items-center gap-1">
                  Order ID
                  {sortField === 'id' &&
                    (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('customerName')}
                data-testid="sort-customerName"
              >
                <div className="flex items-center gap-1">
                  Customer
                  {sortField === 'customerName' &&
                    (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('date')}
                data-testid="sort-date"
              >
                <div className="flex items-center gap-1">
                  Date
                  {sortField === 'date' &&
                    (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('status')}
                data-testid="sort-status"
              >
                <div className="flex items-center gap-1">
                  Status
                  {sortField === 'status' &&
                    (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('category')}
                data-testid="sort-category"
              >
                <div className="flex items-center gap-1">
                  Category
                  {sortField === 'category' &&
                    (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('total')}
                data-testid="sort-total"
              >
                <div className="flex items-center gap-1">
                  Total
                  {sortField === 'total' &&
                    (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort('region')}
                data-testid="sort-region"
              >
                <div className="flex items-center gap-1">
                  Region
                  {sortField === 'region' &&
                    (sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow key={order.id} data-testid="order-row">
                  <TableCell className="font-mono text-sm">{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.date.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[order.status]}>{order.status}</Badge>
                  </TableCell>
                  <TableCell>{order.category}</TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell>{order.region}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSorted.length)} of {filteredAndSorted.length} orders
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              data-testid="prev-page"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              data-testid="next-page"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
