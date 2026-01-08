/**
 * App Sidebar Navigation
 * Left sidebar with navigation links
 */

import { cn } from '@/lib/utils';
import { Link, useLocation } from '@tanstack/react-router';
import { BarChart3, ShoppingCart, Users } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/customers', label: 'Customers', icon: Users },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="bg-card sticky top-0 hidden h-screen w-64 border-r md:block" data-testid="app-sidebar">
      <div className="p-6">
        <h1 className="text-xl font-bold">MetricHub</h1>
        <p className="text-muted-foreground text-sm">Business Analytics</p>
      </div>
      <nav className="px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
