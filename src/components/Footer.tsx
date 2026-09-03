import { useTranslation } from 'react-i18next';

import { API_DISPLAY_URL } from '../api';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="fixed-bottom bg-body-tertiary border-top py-2">
      <div className="container text-center">
        <small className="text-muted">{t('footer.api', { url: API_DISPLAY_URL })}</small>
      </div>
    </footer>
  );
}
