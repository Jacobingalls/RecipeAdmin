import { Outlet } from 'react-router-dom';

import Header from '../Header';
import { ErrorBoundary } from '../common';

import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="min-vh-100 bg-body-tertiary d-flex flex-column">
      <Header />
      <ErrorBoundary>
        <div
          className="container py-4 flex-grow-1 d-flex flex-column flex-md-row gap-4"
          style={{ maxWidth: 880, marginBottom: 50 }}
        >
          <AdminSidebar />
          <main className="flex-grow-1" style={{ minWidth: 0 }}>
            <Outlet />
          </main>
        </div>
      </ErrorBoundary>
    </div>
  );
}
