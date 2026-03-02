import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { CategoriesProvider } from '../../contexts/CategoriesContext';
import { FavoritesProvider } from '../../contexts/FavoritesContext';

import LoadingState from './LoadingState';

export default function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingState />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <CategoriesProvider>
      <FavoritesProvider>
        <Outlet />
      </FavoritesProvider>
    </CategoriesProvider>
  );
}
