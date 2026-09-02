import { useTranslation } from '../../contexts/LocaleContext';

import StatusView from './StatusView';

interface LoadingStateProps {
  /** Overrides the default "Loading..." title. */
  title?: string;
  description?: string;
}

/**
 * Centered loading indicator with spinner, title, and optional description.
 * Mirrors the layout of ContentUnavailableView for visual consistency.
 */
export default function LoadingState({ title, description }: LoadingStateProps) {
  const { t } = useTranslation();

  return (
    <StatusView
      symbol={
        <span
          className="spinner-border fs-1 text-secondary"
          role="status"
          style={{ borderWidth: '0.1em' }}
        >
          <span className="visually-hidden">{t('common.loadingEllipsis')}</span>
        </span>
      }
      title={title ?? t('common.loadingEllipsis')}
      description={description}
    />
  );
}
