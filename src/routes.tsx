import { PageTransition } from '@/components/PageTransition';
import BusinessDashboard from '@/pages/BusinessDashboard';
import CustomersPage from '@/pages/CustomersPage';
import OrdersPage from '@/pages/OrdersPage';
import { Outlet, createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router';

const rootRoute = createRootRoute({
  component: () => (
    <PageTransition>
      <Outlet />
    </PageTransition>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/dashboard' });
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: BusinessDashboard,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: OrdersPage,
});

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customers',
  component: CustomersPage,
});

const routeTree = rootRoute.addChildren([indexRoute, dashboardRoute, ordersRoute, customersRoute]);

const router = createRouter({
  routeTree,
});

export { router };
