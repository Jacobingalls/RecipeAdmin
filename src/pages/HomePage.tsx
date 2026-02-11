import { PasskeySetupPrompt } from '../components/common';
import { HistoryTile } from '../components/home';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const greeting = user?.displayName || user?.username || 'there';

  return (
    <>
      <h1 className="h2 mb-4">Hello, {greeting}</h1>
      <PasskeySetupPrompt />
      <div className="row g-3">
        <div className="col-12">
          <HistoryTile />
        </div>
      </div>
    </>
  );
}
