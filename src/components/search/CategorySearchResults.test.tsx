import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { ApiCategorySearchResult } from '../../api';

import CategorySearchResults from './CategorySearchResults';

function makeResult(
  id: string,
  displayName: string,
  slugPath: string,
  path: string,
): ApiCategorySearchResult {
  return {
    category: {
      id,
      slug: slugPath.split('.').pop()!,
      displayName,
      description: null,
      parents: [],
      children: [],
      notes: [],
    },
    slugPath,
    path,
    relevance: 1,
  };
}

function renderResults(categories: ApiCategorySearchResult[]) {
  return render(
    <MemoryRouter>
      <CategorySearchResults categories={categories} />
    </MemoryRouter>,
  );
}

describe('CategorySearchResults', () => {
  it('shows a categories heading', () => {
    renderResults([makeResult('c1', 'Fruit', 'fruit', 'Fruit')]);
    expect(screen.getByRole('heading', { name: 'Categories' })).toBeInTheDocument();
  });

  it('links each category to its page by slug path', () => {
    renderResults([
      makeResult('c1', 'Sweeteners', 'ingredients.sweeteners', 'Ingredients › Sweeteners'),
    ]);
    expect(screen.getByRole('link', { name: /Sweeteners/ })).toHaveAttribute(
      'href',
      '/categories/ingredients.sweeteners',
    );
  });

  it('shows the full path under a nested category', () => {
    renderResults([
      makeResult('c1', 'Sweeteners', 'ingredients.sweeteners', 'Ingredients › Sweeteners'),
    ]);
    expect(screen.getByText('Ingredients › Sweeteners')).toBeInTheDocument();
  });

  it('leaves the path out for a top-level category', () => {
    renderResults([makeResult('c1', 'Fruit', 'fruit', 'Fruit')]);
    expect(screen.getAllByText('Fruit')).toHaveLength(1);
  });
});
