import { PasskeySetupPrompt } from '../components/common';
import { FavoritesTile, HistoryTile } from '../components/home';
import { useAuth } from '../contexts/AuthContext';

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function HomePage() {
  const { user } = useAuth();
  const name = user?.displayName || user?.username || 'there';

  return (
    <>
      <h1 className="h2 mb-4">
        {getTimeOfDayGreeting()}, {name}
      </h1>
      <PasskeySetupPrompt />
      <div className="row g-3">
        <div className="col-12">
          <FavoritesTile />
        </div>
        <div className="col-12">
          <HistoryTile />
        </div>
      </div>
    </>
  );
}
