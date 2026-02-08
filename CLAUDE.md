# RecipeAdmin

React admin interface for viewing RecipeKit nutrition data. Read-only viewer for products, groups, and barcode lookups.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build to dist/
npm run lint         # Run ESLint on src/
npm run lint:fix     # Run ESLint with auto-fix
npm run format       # Format all src/ files with Prettier
npm run format:check # Check formatting without writing
```

**After making any code changes, always run `npm run lint:fix && npm run format` before committing.**

**When asked to commit, use the `commit-writer` agent.**

## Code Standards

### Engineering Philosophy

- Follow the [React documentation](https://react.dev/) and [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) conventions
- Prefer TypeScript with real types over `any`, JSDoc, or untyped JavaScript — migrate existing files when touching them
- Prefer modern JavaScript: ES modules, async/await, optional chaining, destructuring
- Functional components with hooks — no class components
- Prefer small, reusable components and modules with clear interfaces — one component or class per file
- Code should be testable by design: pure functions, minimal side effects, clear inputs and outputs
- Avoid unsafe patterns: `dangerouslySetInnerHTML`, direct DOM manipulation, `eval`
- Avoid `eslint-disable` comments — fix the underlying issue instead of suppressing the warning

### Documentation

- Code should be self-documenting first
- Public API must be documented (exported functions, hooks, component props)
- Documentation explains **why** or **how to use**, never **what** it does internally
- If you find yourself describing what code does, refactor for clarity instead
- Document unintuitive code as a last resort (prefer refactoring)

**Anti-patterns to avoid:**
- Don't encode current usage patterns (document the capability, not how callers currently use it)
- Don't describe implementation details (readers can read the code for that)
- Don't restate what the signature already tells you

### Testing

- All new code must have tests
- Target 99% or better code coverage
- **Never write tests that work around bugs.** If you discover unexpected behavior while testing:
  1. Write a test that fails demonstrating the issue
  2. Bring it to the user's attention before proceeding
  3. Ask whether to fix it (it may be a misunderstanding of the code, or an actual bug)

### File Responsibilities

- `README.md` - User-focused: how to use the app
- `CLAUDE.md` - Maintainer-focused: architecture, build commands, engineering standards

## Project Structure

```
src/
├── api.ts                 # API client (uses VITE_API_BASE_URL env var)
├── App.tsx                # Root component with routing
├── main.tsx               # Entry point
├── components/
│   ├── common/            # Shared UI components
│   │   ├── index.ts       # Barrel exports
│   │   ├── BackButton     # Navigation back button
│   │   ├── EmptyState     # "No items found" display
│   │   ├── ErrorBoundary  # Catches render errors
│   │   ├── ErrorState     # Error message display
│   │   └── LoadingState   # Loading indicator
│   ├── lookup/            # Barcode lookup components
│   │   ├── index.ts       # Barrel exports
│   │   ├── GroupCard      # Group result card
│   │   ├── LookupResultItem # Dispatches to Product/GroupCard
│   │   └── ProductCard    # Product result card
│   ├── product/           # Product detail components
│   │   ├── index.ts       # Barrel exports
│   │   └── PreparationDetails # Nutrition label + serving selector
│   ├── BarcodeSection     # Barcode list with serving size links
│   ├── CustomSizesSection # Custom size buttons
│   ├── Footer             # App footer
│   ├── Header             # App header with nav
│   ├── NotesDisplay       # Product/barcode notes
│   ├── NutritionLabel     # FDA-style nutrition facts label
│   ├── ServingSizeSelector # Serving size input controls
│   └── VersionBadge       # API version display
├── config/
│   ├── constants.ts       # FDA daily values
│   └── unitConfig.ts      # Unit definitions for serving selector
├── domain/                # Business logic classes
│   ├── index.ts           # Barrel exports
│   ├── CustomSize.ts      # Custom serving size (e.g., "1 cookie")
│   ├── NutritionInformation.ts # Complete nutrition data
│   ├── NutritionUnit.ts   # Amount + unit with conversion
│   ├── Preparation.ts     # Product preparation with nutrition calc
│   ├── ProductGroup.ts    # Product group with aggregate nutrition
│   └── ServingSize.ts     # Serving size types (mass, volume, etc.)
├── hooks/
│   ├── index.ts           # Barrel exports
│   └── useApiQuery.ts     # Data fetching with cancellation
├── pages/                 # Route components
│   ├── index.ts           # Barrel exports
│   ├── GroupDetailPage    # /groups/:id
│   ├── GroupsPage         # /groups
│   ├── LookupPage         # /lookup/:barcode?
│   ├── ProductDetailPage  # /products/:id
│   └── ProductsPage       # /products
└── utils/
    ├── index.ts           # Barrel exports
    └── formatters.ts      # formatSignificant, formatServingSize
```

## Key Patterns

### Data Fetching with useApiQuery

All pages use the `useApiQuery` hook for data fetching:

```tsx
// Simple usage
const { data, loading, error } = useApiQuery(listProducts, [])

// With dynamic parameter
const { data, loading, error } = useApiQuery(() => getProduct(id), [id])

// Conditional fetching
const { data, loading, error } = useApiQuery(
    () => lookupBarcode(barcode),
    [barcode],
    { enabled: !!barcode }
)
```

The hook handles loading states, errors, and request cancellation automatically.

### Common Components

Use components from `src/components/common/` for consistent UI:

```tsx
import { LoadingState, ErrorState, EmptyState, BackButton } from '../components/common'

if (loading) return <LoadingState />
if (error) return <ErrorState message={error} />
if (!data) return <EmptyState message="Not found" />
```

### Domain Models

Domain classes in `src/domain/` handle nutrition calculations:

- `Preparation` - Call `prep.nutritionalInformationFor(servingSize)` to get scaled nutrition
- `ServingSize` - Create with `ServingSize.servings(n)`, `.mass(amount, unit)`, `.volume()`, `.energy()`, `.customSize()`
- `NutritionUnit` - Handles unit conversion via `.converted(unit)`

### Barrel Exports

Import from index files:

```tsx
import { useApiQuery } from '../hooks'
import { ServingSize, Preparation } from '../domain'
import { LoadingState, ErrorState } from '../components/common'
```

## Environment Variables

Configure in `.env` (see `.env.example`):

```
VITE_API_BASE_URL=http://localhost:8080
```

## Styling

Uses Bootstrap 5 classes. No custom CSS files - all styling via utility classes.
