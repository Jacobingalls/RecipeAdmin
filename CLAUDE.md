# RecipeAdmin

React admin interface for viewing RecipeKit nutrition data. Read-only viewer for products, groups, and barcode lookups.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build to dist/
```

## Code Standards

### Engineering Philosophy

- Follow the [React documentation](https://react.dev/) and [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) conventions
- Prefer TypeScript with real types over `any`, JSDoc, or untyped JavaScript — migrate existing files when touching them
- Prefer modern JavaScript: ES modules, async/await, optional chaining, destructuring
- Functional components with hooks — no class components
- Prefer small, reusable components and modules with clear interfaces — one component or class per file
- Code should be testable by design: pure functions, minimal side effects, clear inputs and outputs
- Avoid unsafe patterns: `dangerouslySetInnerHTML`, direct DOM manipulation, `eval`

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
├── api.js                 # API client (uses VITE_API_BASE_URL env var)
├── App.jsx                # Root component with routing
├── components/
│   ├── common/            # Shared UI components
│   │   ├── BackButton     # Navigation back button
│   │   ├── EmptyState     # "No items found" display
│   │   ├── ErrorBoundary  # Catches render errors
│   │   ├── ErrorState     # Error message display
│   │   └── LoadingState   # Loading indicator
│   ├── lookup/            # Barcode lookup components
│   │   ├── GroupCard      # Group result card
│   │   ├── LookupResultItem # Dispatches to Product/GroupCard
│   │   └── ProductCard    # Product result card
│   ├── product/           # Product detail components
│   │   └── PreparationDetails # Nutrition label + serving selector
│   └── [other components] # NutritionLabel, ServingSizeSelector, etc.
├── config/
│   ├── constants.js       # FDA daily values
│   └── unitConfig.js      # Unit definitions for serving selector
├── domain/                # Business logic classes
│   ├── CustomSize.js      # Custom serving size (e.g., "1 cookie")
│   ├── NutritionInformation.js # Complete nutrition data
│   ├── NutritionUnit.js   # Amount + unit with conversion
│   ├── Preperation.js     # Product preparation with nutrition calc
│   └── ServingSize.js     # Serving size types (mass, volume, etc.)
├── hooks/
│   └── useApiQuery.js     # Data fetching with cancellation
├── pages/                 # Route components
│   ├── GroupDetailPage    # /groups/:id
│   ├── GroupsPage         # /groups
│   ├── LookupPage         # /lookup/:barcode?
│   ├── ProductDetailPage  # /products/:id
│   └── ProductsPage       # /products
└── utils/
    └── formatters.js      # formatSignificant, formatServingSize
```

## Key Patterns

### Data Fetching with useApiQuery

All pages use the `useApiQuery` hook for data fetching:

```jsx
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

```jsx
import { LoadingState, ErrorState, EmptyState, BackButton } from '../components/common'

if (loading) return <LoadingState />
if (error) return <ErrorState message={error} />
if (!data) return <EmptyState message="Not found" />
```

### Domain Models

Domain classes in `src/domain/` handle nutrition calculations:

- `Preperation` - Call `prep.nutritionalInformationFor(servingSize)` to get scaled nutrition
- `ServingSize` - Create with `ServingSize.servings(n)`, `.mass(amount, unit)`, `.volume()`, `.energy()`, `.customSize()`
- `NutritionUnit` - Handles unit conversion via `.converted(unit)`

### Barrel Exports

Import from index files:

```jsx
import { useApiQuery } from '../hooks'
import { ServingSize, Preperation } from '../domain'
import { LoadingState, ErrorState } from '../components/common'
```

## Environment Variables

Configure in `.env` (see `.env.example`):

```
VITE_API_BASE_URL=http://localhost:8080
```

## Styling

Uses Bootstrap 5 classes. No custom CSS files - all styling via utility classes.
