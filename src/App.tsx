import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { AdminLayout } from './components/admin';
import Header from './components/Header';
import { ErrorBoundary, RequireAuth, RequireAdmin } from './components/common';
import { AuthProvider } from './contexts/AuthContext';
import { useTheme } from './hooks';
import {
  AdminGroupEditorPage,
  AdminProductEditorPage,
  AdminUserDetailPage,
  AdminUsersPage,
  FavoritesPage,
  GroupDetailPage,
  GroupsPage,
  HistoryPage,
  HomePage,
  LoginPage,
  LookupPage,
  ProductDetailPage,
  ProductsPage,
  SearchPage,
  SettingsPage,
} from './pages';

function AppLayout() {
  return (
    <div className="min-vh-100 bg-body-tertiary d-flex flex-column">
      <Header />
      <ErrorBoundary>
        <main className="container py-4 flex-grow-1" style={{ maxWidth: 600, marginBottom: 50 }}>
          <Outlet />
        </main>
      </ErrorBoundary>
    </div>
  );
}

export default function App() {
  useTheme();

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route element={<RequireAuth />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/lookup/:barcode?" element={<LookupPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/groups/:id" element={<GroupDetailPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route element={<AdminLayout />}>
            <Route element={<RequireAuth />}>
              <Route element={<RequireAdmin />}>
                <Route path="/admin" element={<Navigate to="/admin/products" replace />} />
                <Route path="/admin/products" element={<ProductsPage />} />
                <Route path="/admin/products/:id" element={<AdminProductEditorPage />} />
                <Route path="/admin/groups" element={<GroupsPage />} />
                <Route path="/admin/groups/:id" element={<AdminGroupEditorPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
