import { Link, useParams } from 'react-router-dom';

import { getGroup } from '../api';
import type { ProductGroupData } from '../domain';
import { useApiQuery } from '../hooks';
import { LoadingState, ErrorState, ContentUnavailableView } from '../components/common';

export default function AdminGroupEditorPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: groupData,
    loading,
    error,
  } = useApiQuery<ProductGroupData>(() => getGroup(id!), [id], {
    errorMessage: "Couldn't load this group. Try again later.",
  });

  return (
    <>
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {!loading && !error && !groupData && (
        <ContentUnavailableView icon="bi-collection" title="Group not found" />
      )}
      {!loading && !error && groupData && (
        <>
          <h1 className="mb-1">{groupData.name}</h1>
          <p className="text-body-secondary mb-4">
            {groupData.items?.length ?? 0} item{(groupData.items?.length ?? 0) !== 1 ? 's' : ''}
          </p>
          <ContentUnavailableView icon="bi-pencil-square" title="Coming soon" />
          <div className="text-center mt-3">
            <Link to={`/groups/${id}`}>View group</Link>
          </div>
        </>
      )}
    </>
  );
}
