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
  const icon = kind === 'passkey' ? 'bi-fingerprint' : 'bi-key';

  let secondary;
  if (isExpired && expiresAt) {
    secondary = (
      <span className="text-danger-emphasis">Expired {formatRelativeTime(expiresAt)}</span>
    );
  } else if (isTemporary && expiresAt) {
    secondary = <>Expires {formatRelativeTime(expiresAt)}</>;
  } else if (createdAt) {
    secondary = <>Created {formatRelativeTime(createdAt)}</>;
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

  const deleteLabel = kind === 'passkey' ? `Delete passkey ${name}` : `Revoke API key ${name}`;

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
