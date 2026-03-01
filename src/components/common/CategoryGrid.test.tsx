import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import type { ApiCategory } from '../../api';

import CategoryGrid from './CategoryGrid';

const sampleCategories: ApiCategory[] = [
  {
    id: 'cat-1',
    slug: 'fruit',
    displayName: 'Fruit',
    description: null,
    parents: [],
    children: [],
    notes: [],
  },
  {
    id: 'cat-2',
    slug: 'vegetables',
    displayName: 'Vegetables',
    description: null,
    parents: [],
    children: [],
    notes: [],
  },
];

describe('CategoryGrid', () => {
  it('renders category cards with display names', () => {
    render(
      <MemoryRouter>
        <CategoryGrid categories={sampleCategories} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Fruit')).toBeInTheDocument();
    expect(screen.getByText('Vegetables')).toBeInTheDocument();
  });

  it('links to /categories/:slug by default', () => {
    render(
      <MemoryRouter>
        <CategoryGrid categories={sampleCategories} />
      </MemoryRouter>,
    );
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/categories/fruit');
    expect(links[1]).toHaveAttribute('href', '/categories/vegetables');
  });

  it('links to custom basePath when provided', () => {
    render(
      <MemoryRouter>
        <CategoryGrid categories={sampleCategories} basePath="/admin/categories" />
      </MemoryRouter>,
    );
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/admin/categories/fruit');
    expect(links[1]).toHaveAttribute('href', '/admin/categories/vegetables');
  });

  it('prepends parentPath to slug in links', () => {
    render(
      <MemoryRouter>
        <CategoryGrid categories={sampleCategories} parentPath="food" />
      </MemoryRouter>,
    );
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/categories/food.fruit');
    expect(links[1]).toHaveAttribute('href', '/categories/food.vegetables');
  });

  it('combines basePath and parentPath', () => {
    render(
      <MemoryRouter>
        <CategoryGrid
          categories={sampleCategories}
          basePath="/admin/categories"
          parentPath="food.dairy"
        />
      </MemoryRouter>,
    );
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/admin/categories/food.dairy.fruit');
    expect(links[1]).toHaveAttribute('href', '/admin/categories/food.dairy.vegetables');
  });
});
