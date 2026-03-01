import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './components/common/AppLayout';
import PrivateRoute from './components/common/PrivateRoute';
import AdminRoute from './components/common/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyPage from './pages/MyPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';
import CouponsPage from './pages/CouponsPage';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/:id', element: <ProductDetailPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      {
        element: <PrivateRoute />,
        children: [
          { path: '/my', element: <MyPage /> },
          { path: '/cart', element: <CartPage /> },
          { path: '/orders', element: <OrdersPage /> },
          { path: '/orders/:id', element: <OrderDetailPage /> },
          { path: '/coupons', element: <CouponsPage /> },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: <Navigate to='/admin/products' replace /> },
          { path: '/admin/products', element: <AdminProductsPage /> },
          { path: '/admin/orders', element: <AdminOrdersPage /> },
          { path: '/admin/users', element: <AdminUsersPage /> },
          { path: '/admin/coupons', element: <AdminCouponsPage /> },
        ],
      },
    ],
  },
]);

export default router;
