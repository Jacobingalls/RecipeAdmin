import type { ReactNode } from 'react';

import type { ApiProduct } from '../../api';
import { SectionHeader } from '../common';

interface ProductProfileFormProps {
  product: ApiProduct;
  onChange: (product: ApiProduct) => void;
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

export default function ProductProfileForm({ product, onChange }: ProductProfileFormProps) {
  const defaultPrepId = product.defaultPreparationID ?? product.preparations[0]?.id ?? '';

  return (
    <>
      <SectionHeader title="Profile" className="mt-4" />
      <div className="list-group">
        <InlineFormField htmlFor="edit-product-name" label="Name">
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ maxWidth: '20rem' }}
            id="edit-product-name"
            value={product.name}
            onChange={(e) => onChange({ ...product, name: e.target.value })}
            required
          />
        </InlineFormField>
        <InlineFormField htmlFor="edit-product-brand" label="Brand">
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ maxWidth: '20rem' }}
            id="edit-product-brand"
            value={product.brand}
            onChange={(e) => onChange({ ...product, brand: e.target.value })}
            placeholder="Optional"
          />
        </InlineFormField>
        {product.preparations.length > 0 && (
          <InlineFormField htmlFor="edit-default-prep" label="Default preparation">
            <select
              className="form-select form-select-sm"
              style={{ maxWidth: '14rem' }}
              id="edit-default-prep"
              value={defaultPrepId}
              onChange={(e) =>
                onChange({ ...product, defaultPreparationID: e.target.value || undefined })
              }
            >
              {product.preparations.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || 'Default'}
                </option>
              ))}
            </select>
          </InlineFormField>
        )}
      </div>
    </>
  );
}
