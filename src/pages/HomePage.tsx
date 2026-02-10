import { Link } from 'react-router-dom';

import { PasskeySetupPrompt } from '../components/common';
import { HistoryTile } from '../components/home';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const greeting = user?.displayName || user?.username || 'there';

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">Hello, {greeting}</h1>
        <Link to="/settings" className="btn btn-outline-secondary btn-sm" aria-label="Settings">
          <i className="bi bi-gear" aria-hidden="true" />
        </Link>
      </div>
      <PasskeySetupPrompt />
      <div className="row g-3">
        <div className="col-12">
          <HistoryTile />
        </div>
      </div>
    </>
  );
}
