import { useParams, useNavigate } from 'react-router-dom';

import { adminGetUser } from '../api';
import { LoadingState, ErrorState } from '../components/common';
import {
  AdminUserProfileForm,
  AdminCredentialsSection,
  DangerZoneSection,
} from '../components/admin-user-detail';
import { useApiQuery } from '../hooks';

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: user,
    loading,
    error,
    refetch,
  } = useApiQuery(() => adminGetUser(id!), [id], {
    errorMessage: "Couldn't load this user. Try again later.",
  });

  if (loading && !user) return <LoadingState />;
  if (error && !user) return <ErrorState message={error} />;
  if (!user) return <ErrorState message="User not found" />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h1 className="h4 mb-0">{user.displayName || user.username}</h1>
      </div>
      <p className="text-body-secondary small mb-3">
        <code>{user.id}</code>
        {user.createdAt && (
          <>
            <span className="mx-1">&middot;</span>
            Created {new Date(user.createdAt * 1000).toLocaleDateString()}
          </>
        )}
      </p>

      <AdminUserProfileForm userId={id!} initialUser={user} onSaved={refetch} />

      <AdminCredentialsSection
        userId={id!}
        passkeys={user.passkeys}
        apiKeys={user.apiKeys}
        onChanged={refetch}
      />

      <DangerZoneSection
        userId={id!}
        username={user.username}
        onDeleted={() => navigate('/admin/users')}
      />
    </div>
  );
}
