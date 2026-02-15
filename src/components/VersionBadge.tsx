import { getAdminEnvironment, getAdminVersion } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function VersionBadge() {
  const { apiVersion, apiEnvironment } = useAuth();
  const adminVersion = getAdminVersion();
  const adminEnvironment = getAdminEnvironment();

  const environment = adminEnvironment ?? apiEnvironment;

  if (!environment && !adminVersion) return null;

  const apiLabel = apiVersion ? `API v${apiVersion}` : null;

  if (adminVersion) {
    const parts = [environment, `v${adminVersion}`].filter(Boolean).join(', ');
    return (
      <small
        className="text-light d-block"
        style={{ fontSize: '0.55rem', marginTop: -8, opacity: 0.7 }}
      >
        {parts}
        {apiLabel && ` (${apiLabel})`}
      </small>
    );
  }

  const version = apiVersion ? `v${apiVersion}` : null;

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
