import { useAuth } from '../contexts/AuthContext';

export default function VersionBadge() {
  const { apiVersion, apiEnvironment } = useAuth();

  if (!apiEnvironment) return null;

  const version = apiVersion ? `v${apiVersion}` : null;

  return (
    <small
      className="text-light d-block"
      style={{ fontSize: '0.55rem', marginTop: -8, opacity: 0.7 }}
    >
      {apiEnvironment}
      {version && `, ${version}`}
    </small>
  );
}
