import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Header from './components/Header';
import { ErrorBoundary } from './components/common';
import { useTheme } from './hooks';
import HomePage from './pages/HomePage';
import LookupPage from './pages/LookupPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  useTheme();

  return (
    <BrowserRouter>
      <div className="min-vh-100 bg-body-tertiary d-flex flex-column">
        <Header />
        <ErrorBoundary>
          <div className="container py-4 flex-grow-1" style={{ maxWidth: 600, marginBottom: 50 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/lookup/:barcode?" element={<LookupPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/groups" element={<GroupsPage />} />
              <Route path="/groups/:id" element={<GroupDetailPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </ErrorBoundary>
      </div>
    </BrowserRouter>
  );
}
