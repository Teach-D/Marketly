import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export default function AdminRoute() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to='/login' replace />;
  if (user.role !== 'ADMIN') return <Navigate to='/' replace />;
  return <Outlet />;
}
