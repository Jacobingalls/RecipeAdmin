import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { CategoriesProvider } from '../../contexts/CategoriesContext';
import { FavoritesProvider } from '../../contexts/FavoritesContext';
import type { ReturnLocationState } from '../../utils';

import LoadingState from './LoadingState';

export default function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingState />;
  if (!isAuthenticated) {
    const state: ReturnLocationState = { from: `${location.pathname}${location.search}` };
    return <Navigate to="/login" replace state={state} />;
  }

  return (
    <CategoriesProvider>
      <FavoritesProvider>
        <Outlet />
      </FavoritesProvider>
    </CategoriesProvider>
  );
}
