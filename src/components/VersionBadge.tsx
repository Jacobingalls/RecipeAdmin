import type { ApiVersion } from '../api';
import { getVersion } from '../api';
import { useApiQuery } from '../hooks';

export default function VersionBadge() {
  const { data, loading, error } = useApiQuery<ApiVersion>(getVersion, []);

  if (loading) {
    return null;
  }

  if (error || !data) {
    return (
      <small className="text-danger d-block" style={{ fontSize: '0.7rem', marginTop: -4 }}>
        Error loading version
      </small>
    );
  }

  const environment = data.debug ? 'Debug' : 'Production';
  const version = data.version ? `v${data.version}` : null;

  return (
    <small
      className="text-light d-block"
      style={{ fontSize: '0.55rem', marginTop: -8, opacity: 0.7 }}
    >
      {environment}
      {version && `, ${version}`}
    </small>
  );
}
