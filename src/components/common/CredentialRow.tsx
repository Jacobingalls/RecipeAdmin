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
  onDelete,
}: CredentialRowProps) {
  const icon = kind === 'passkey' ? 'bi-fingerprint' : 'bi-key';

  let secondary;
  if (isTemporary && expiresAt) {
    secondary = <>Expires {formatRelativeTime(expiresAt)}</>;
  } else if (createdAt) {
    secondary = <>Created {formatRelativeTime(createdAt)}</>;
  }

  const content =
    kind === 'apiKey' && keyPrefix ? (
      <>
        <strong>{name}</strong>
        <code className="ms-2">{keyPrefix}...</code>
      </>
    ) : (
      <strong>{name}</strong>
    );

  const deleteLabel = kind === 'passkey' ? `Delete passkey ${name}` : `Revoke API key ${name}`;

  return (
    <ListRow icon={icon} content={content} secondary={secondary}>
      <DeleteButton ariaLabel={deleteLabel} onClick={onDelete} />
    </ListRow>
  );
}
