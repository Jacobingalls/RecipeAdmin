import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { AdminLayout } from './components/admin';
import Header from './components/Header';
import { ErrorBoundary } from './components/common';
import RequireAuth from './components/common/RequireAuth';
import RequireAdmin from './components/common/RequireAdmin';
import { AuthProvider } from './contexts/AuthContext';
import { useTheme } from './hooks';
import HomePage from './pages/HomePage';
import LookupPage from './pages/LookupPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import AdminProductEditorPage from './pages/AdminProductEditorPage';
import AdminGroupEditorPage from './pages/AdminGroupEditorPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminUserDetailPage from './pages/AdminUserDetailPage';

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
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route element={<AdminLayout />}>
            <Route element={<RequireAuth />}>
              <Route element={<RequireAdmin />}>
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
