import { useTranslation } from 'react-i18next';

import type { ApiCategorySearchResult } from '../../api';
import { LinkListItem, SubsectionTitle } from '../common';

interface CategorySearchResultsProps {
  categories: ApiCategorySearchResult[];
}

export default function CategorySearchResults({ categories }: CategorySearchResultsProps) {
  const { t } = useTranslation();

  return (
    <section className="mb-4">
      <SubsectionTitle>{t('search.categories')}</SubsectionTitle>
      <div className="list-group">
        {categories.map(({ category, slugPath, path }) => (
          <LinkListItem
            key={category.id}
            to={`/categories/${slugPath}`}
            icon="bi-folder"
            title={category.displayName}
            subtitle={path === category.displayName ? undefined : path}
          />
        ))}
      </div>
    </section>
  );
}
