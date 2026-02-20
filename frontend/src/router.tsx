import { createBrowserRouter } from 'react-router-dom';
import PrivateRoute from './components/common/PrivateRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyPage from './pages/MyPage';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <PrivateRoute />,
    children: [{ path: '/my', element: <MyPage /> }],
  },
  { path: '/', element: <LoginPage /> },
]);

export default router;
