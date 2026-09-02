import type { ReactNode } from 'react';

import type { ProductGroupData } from '../../domain';
import { useTranslation } from '../../contexts/LocaleContext';
import { SectionHeader } from '../common';

interface GroupProfileFormProps {
  group: ProductGroupData;
  onChange: (group: ProductGroupData) => void;
}

function InlineFormField({
  htmlFor,
  label,
  children,
}: {
  htmlFor: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="list-group-item d-flex align-items-center justify-content-between py-3"
    >
      <span className="me-3 flex-shrink-0">{label}</span>
      {children}
    </label>
  );
}

export default function GroupProfileForm({ group, onChange }: GroupProfileFormProps) {
  const { t } = useTranslation();

  return (
    <>
      <SectionHeader title={t('editor.profile')} className="mt-4" />
      <div className="list-group">
        <InlineFormField htmlFor="edit-group-name" label={t('common.name')}>
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ maxWidth: '20rem' }}
            id="edit-group-name"
            value={group.name ?? ''}
            onChange={(e) => onChange({ ...group, name: e.target.value })}
            required
          />
        </InlineFormField>
        <InlineFormField htmlFor="edit-group-brand" label={t('common.brand')}>
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ maxWidth: '20rem' }}
            id="edit-group-brand"
            value={group.brand ?? ''}
            onChange={(e) => onChange({ ...group, brand: e.target.value })}
            placeholder={t('common.optional')}
          />
        </InlineFormField>
      </div>
    </>
  );
}
