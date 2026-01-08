import { PageTransition } from '@/components/PageTransition';
import BusinessDashboard from '@/pages/BusinessDashboard';
import ComponentsShowcasePage from '@/pages/ComponentsShowcase';
import CustomersPage from '@/pages/CustomersPage';
import OrdersPage from '@/pages/OrdersPage';
import { Outlet, createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router';
import LoginPage from './components/Login.tsx';
import VerifyOtpPage from './components/VerifyOtp.tsx';

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

const componentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/components',
  component: ComponentsShowcasePage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const verifyOtpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login/verify',
  component: VerifyOtpPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  ordersRoute,
  customersRoute,
  componentsRoute,
  loginRoute,
  verifyOtpRoute,
]);

const router = createRouter({
  routeTree,
  context: {
    auth: {
      session: null as Session | null,
      loading: true,
    },
  },
});

export { router };
