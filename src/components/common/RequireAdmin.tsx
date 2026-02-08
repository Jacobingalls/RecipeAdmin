import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';

import LoadingState from './LoadingState';

export default function RequireAdmin() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingState />;
  if (!user?.isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
