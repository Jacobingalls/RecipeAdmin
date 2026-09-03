import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { PasskeySetupPrompt } from '../components/common';
import { TodayTile, FavoritesTile } from '../components/home';
import { useAuth } from '../contexts/AuthContext';
import type { MessageKey } from '../i18n';

function getTimeOfDayGreetingKey(): MessageKey {
  const hour = new Date().getHours();
  if (hour < 12) return 'home.greeting.morning';
  if (hour < 17) return 'home.greeting.afternoon';
  return 'home.greeting.evening';
}

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const name = user?.displayName || user?.username || t('home.greeting.fallbackName');
  const [todayRefreshSignal, setTodayRefreshSignal] = useState(0);

  const handleItemLogged = useCallback(() => {
    setTodayRefreshSignal((n) => n + 1);
  }, []);

  return (
    <>
      <h1 className="h2 mb-4">
        {t(getTimeOfDayGreetingKey())}, {name}
      </h1>
      <PasskeySetupPrompt />
      <div className="row g-4">
        <div className="col-12">
          <TodayTile refreshSignal={todayRefreshSignal} />
        </div>
        <div className="col-12">
          <FavoritesTile onItemLogged={handleItemLogged} />
        </div>
      </div>
    </>
  );
}
