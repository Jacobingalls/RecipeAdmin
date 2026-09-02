import { useTranslation } from '../../contexts/LocaleContext';
import { formatRelativeTime } from '../../utils';

import DeleteButton from './DeleteButton';
import ListRow from './ListRow';

interface CredentialRowProps {
  kind: 'passkey' | 'apiKey';
  name: string;
  keyPrefix?: string;
  createdAt?: number;
  expiresAt?: number;
  isTemporary?: boolean;
  isExpired?: boolean;
  onDelete: () => void;
}

/**
 * Passkey or API key row with icon, name, timestamp, and delete action.
 *
 * ```tsx
 * <CredentialRow kind="passkey" name="MacBook" createdAt={1700000000} onDelete={handleDelete} />
 * <CredentialRow kind="apiKey" name="CI Key" keyPrefix="rk_abc" createdAt={1700000000} onDelete={handleDelete} />
 * ```
 */
export default function CredentialRow({
  kind,
  name,
  keyPrefix,
  createdAt,
  expiresAt,
  isTemporary,
  isExpired,
  onDelete,
}: CredentialRowProps) {
  const { t } = useTranslation();

  const icon = kind === 'passkey' ? 'bi-fingerprint' : 'bi-key';

  let secondary;
  if (isExpired && expiresAt) {
    secondary = (
      <span className="text-danger-emphasis">
        {t('credential.expired', { time: formatRelativeTime(expiresAt) })}
      </span>
    );
  } else if (isTemporary && expiresAt) {
    secondary = t('credential.expires', { time: formatRelativeTime(expiresAt) });
  } else if (createdAt) {
    secondary = t('credential.created', { time: formatRelativeTime(createdAt) });
  }

  const content =
    kind === 'apiKey' && keyPrefix ? (
      <>
        <strong className={isExpired ? 'text-body-tertiary' : undefined}>{name}</strong>
        <code className={`ms-2${isExpired ? ' text-body-tertiary' : ''}`}>{keyPrefix}...</code>
      </>
    ) : (
      <strong className={isExpired ? 'text-body-tertiary' : undefined}>{name}</strong>
    );

  const deleteLabel =
    kind === 'passkey'
      ? t('credential.deletePasskey', { name })
      : t('credential.revokeApiKey', { name });

  return (
    <ListRow
      icon={icon}
      content={content}
      secondary={secondary}
      className={isExpired ? 'opacity-75' : undefined}
    >
      <DeleteButton ariaLabel={deleteLabel} onClick={onDelete} />
    </ListRow>
  );
}
