# RecipeAdmin

React admin interface for RecipeKit nutrition data. Supports viewing products, groups, barcode lookups, food logging, and user/credential administration.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build to dist/
npm run lint         # Run ESLint on src/
npm run lint:fix     # Run ESLint with auto-fix
npm run format       # Format all src/ files with Prettier
npm run format:check # Check formatting without writing
```

**After making any code changes, always use the `lint-format-test-runner` agent to run linting, formatting, and tests.** Never run `npm run lint`, `npm run lint:fix`, `npm run format`, `npm run format:check`, or `npm test`/`npx vitest` directly — always delegate to the agent instead.

**Do not commit unless explicitly asked.** When asked to commit, use the `commit-writer` agent.

## Code Standards

### Writing style

All user-facing strings must follow `WRITING_STYLE.md`. **Always invoke the `/writing-style` skill when adding or changing user-facing text.** Never skip this step.

### Engineering Philosophy

- Follow the [React documentation](https://react.dev/) and [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) conventions
- Prefer TypeScript with real types over `any`, JSDoc, or untyped JavaScript — migrate existing files when touching them
- Prefer modern JavaScript: ES modules, async/await, optional chaining, destructuring
- Functional components with hooks — no class components
- Code should be testable by design: pure functions, minimal side effects, clear inputs and outputs
- Avoid unsafe patterns: `dangerouslySetInnerHTML`, direct DOM manipulation, `eval`
- Avoid `eslint-disable` comments — fix the underlying issue instead of suppressing the warning

### Component Architecture

**Size limits:**
- Components should not exceed 200 lines — if a component grows beyond this, decompose it
- Page components orchestrate sections; they should not contain inline modal definitions or long lists of state variables
- Extract each logical section of a page (e.g., profile, credentials, sessions) into its own component
- Extract every modal into its own component file

**Reuse shared components:**
- **ALWAYS check `src/components/common/` for existing shared components before building new UI.** Also search for similar patterns in nearby components — if the same pattern exists elsewhere, extract it into a shared component rather than reimplementing it.
- When you see the same UI pattern in 2+ places, extract it to `src/components/common/`
- Shared components live in `src/components/common/` with barrel exports via `index.ts`
- See `REFACTORING_PLAN.md` for the current backlog of extraction opportunities

**Available shared components** (use these instead of reimplementing):
- `Button` — semantic wrapper around Bootstrap button classes with `variant` and `size` props
- `CircularButton` — 2.75rem (44px) circular icon button; shows individual hover when standalone, defers to group when inside `CircularButtonGroup`
- `CircularButtonGroup` — inline-flex pill container with unified hover for adjacent `CircularButton` children
- `ListFilter` — shared name-text + dropdown filter row with accessible labels, used across list pages
- `ModalBase` — modal wrapper with backdrop, scroll lock, focus trapping, backdrop-click-to-dismiss, and ARIA attributes
- `ModalHeader`, `ModalBody`, `ModalFooter` — standard modal section components (exported from `ModalBase`)
- `ListRow` — horizontal layout: `[icon] [content] [spacer] [secondary] [actions]`
- `DeleteButton` — circular icon-only trash button for list row actions (uses `CircularButton`)
- `MoreButton` — circular icon-only three-dots button for dropdown menus in list rows (uses `CircularButton`)
- `CopyButton` — button with "Copied!" feedback for clipboard operations
- `TypeToConfirmModal` — "type name to confirm" modal for destructive actions
- `SectionHeader` — `[h5 title] [spacer] [action children]` for section headings with optional actions
- `CredentialRow` — passkey/API key row with icon, name, timestamp, and delete action
- `LinkListItem` — navigational list group item with stacked (title/subtitle) or split (title/trailing) layout
- `LoadingState`, `ErrorState`, `ContentUnavailableView` — standard status displays
- `RequireAuth`, `RequireAdmin` — route guards
- `StatusView` — base layout for centered status displays

**Composition patterns:**
- Prefer `children` and explicit props over deeply nested prop drilling
- One component or class per file — keep responsibilities clear
- Colocate state with the component that owns it; lift only when two siblings need to share

### Design & Accessibility

Follow the [Inclusive Design Principles](https://inclusivedesignprinciples.info/) for clean, intentional, responsive, accessible UI:

**Accessibility (WCAG 2.2 AA compliance):**
- Semantic HTML first — use `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<header>`, `<footer>` over generic `<div>`
- All interactive elements must be keyboard accessible with visible focus indicators
- Images require meaningful `alt` text (or `alt=""` for decorative images)
- Form inputs must have associated `<label>` elements (via `htmlFor`/`id`)
- Color must not be the sole means of conveying information — pair with text, icons, or patterns
- Maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text
- Use ARIA attributes only when semantic HTML is insufficient — follow the [WAI-ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- Dynamic content updates must be announced to assistive technology (via `role="alert"`, `role="status"`, or `aria-live` regions)
- `eslint-plugin-jsx-a11y` enforces accessibility rules at lint time — treat violations as errors

**Responsive design:**
- Mobile-first approach — design for small screens, then enhance for larger ones
- Use Bootstrap's responsive grid (`container`, `row`, `col-*`) and breakpoint utilities (`col-md-*`, `d-md-*`)
- Touch targets must be at least 44x44 CSS pixels
- Avoid fixed widths — use relative units (`rem`, `%`) and `max-width` for readable line lengths
- Test layouts at standard breakpoints: 320px, 768px, 1024px, 1440px

**Clean, intentional UI:**
- Prioritize content — every element should serve a clear purpose
- Use Bootstrap 5 utility classes for styling; avoid custom CSS unless Bootstrap utilities cannot express the design
- Maintain consistent spacing, typography, and component patterns across pages
- Provide comparable experiences across devices and assistive technologies

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
├── api.ts                 # API client (credentials:'include', 401 handling, auth/admin APIs)
├── App.tsx                # Root component with AuthProvider + routing
├── main.tsx               # Entry point
├── components/
│   ├── common/            # Shared UI components
│   │   ├── index.ts       # Barrel exports
│   │   ├── Button          # Semantic Bootstrap button with variant/size props
│   │   ├── CircularButton  # 2rem icon button; standalone circle or grouped pill
│   │   ├── CircularButtonGroup # Pill hover container for adjacent CircularButtons
│   │   ├── ContentUnavailableView # Centered empty state with icon/title/description
│   │   ├── CopyButton     # Clipboard copy with "Copied!" feedback
│   │   ├── CredentialRow  # Passkey/API key row with icon, name, timestamp, delete
│   │   ├── DeleteButton   # Circular icon-only trash button for list rows
│   │   ├── ErrorBoundary  # Catches render errors
│   │   ├── ErrorState     # Error message display
│   │   ├── LinkListItem   # Navigational list group item with stacked/split layout
│   │   ├── ListRow        # [icon + content + spacer + secondary + actions] layout
│   │   ├── ListFilter     # Name-text + dropdown filter row for list pages
│   │   ├── LoadingState   # Loading indicator
│   │   ├── ModalBase      # Modal wrapper + ModalHeader/ModalBody/ModalFooter sub-components
│   │   ├── PasskeySetupPrompt # Banner prompting users without passkeys to register one
│   │   ├── RequireAdmin   # Route guard: redirects non-admins to /
│   │   ├── RequireAuth    # Route guard: redirects unauthenticated to /login, shows PasskeySetupPrompt
│   │   ├── SectionHeader  # [h5 title + spacer + action children] section heading
│   │   ├── TypeToConfirmModal # "Type name to confirm" destructive action modal
│   │   └── StatusView     # Base layout for centered status displays
│   ├── admin-user-detail/ # Admin user detail page sections
│   │   ├── index.ts       # Barrel exports
│   │   ├── AdminUserProfileForm # User profile editing form
│   │   ├── AdminCredentialsSection # Credential list + temp key generation
│   │   ├── TempAPIKeyModal # Temporary API key display
│   │   └── DangerZoneSection # Revoke sessions + delete user
│   ├── lookup/            # Barcode lookup components
│   │   ├── index.ts       # Barrel exports
│   │   ├── GroupCard      # Group result card
│   │   ├── LookupResultItem # Dispatches to Product/GroupCard
│   │   └── ProductCard    # Product result card
│   ├── group/             # Group detail components
│   │   ├── index.ts       # Barrel exports
│   │   └── GroupItemRow   # Single item row within a product group
│   ├── product/           # Product detail components
│   │   ├── index.ts       # Barrel exports
│   │   └── PreparationDetails # Nutrition label + serving selector
│   ├── settings/          # Settings page sections
│   │   ├── index.ts       # Barrel exports
│   │   ├── ProfileSection # Display name viewing/editing
│   │   ├── CredentialsSection # Passkey + API key list with add dropdown
│   │   ├── CreateAPIKeyModal # Key creation form with expiry toggle
│   │   └── SessionsSection # Session list with sign-out controls
│   ├── BarcodeSection     # Barcode list with serving size links
│   ├── CustomSizesSection # Custom size buttons
│   ├── Footer             # App footer
│   ├── Header             # App header with nav, user dropdown, admin link
│   ├── NotesDisplay       # Product/barcode notes
│   ├── NutritionLabel     # FDA-style nutrition facts label
│   ├── NutritionRow       # Individual nutrient row for NutritionLabel table
│   ├── ServingSizeSelector # Serving size input controls
│   └── VersionBadge       # API version display
├── config/
│   ├── constants.ts       # FDA daily values
│   └── unitConfig.ts      # Unit definitions for serving selector
├── contexts/
│   └── AuthContext.tsx     # Auth state, login/logout/passkey methods
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
│   ├── useApiQuery.ts     # Data fetching with cancellation
│   ├── useGravatarUrl.ts  # Gravatar avatar URL from email via SHA-256 hash
│   └── useHistoryData.ts  # Shared history data fetching, nutrition resolution, log actions
├── pages/                 # Route components
│   ├── index.ts           # Barrel exports
│   ├── AdminUserDetailPage # /admin/users/:id — credential management
│   ├── AdminUsersPage     # /admin/users — user list + create
│   ├── GroupDetailPage    # /groups/:id
│   ├── GroupsPage         # /groups
│   ├── HistoryPage        # /history
│   ├── HomePage           # /
│   ├── LoginPage          # /login — passkey + API key login
│   ├── LookupPage         # /lookup/:barcode?
│   ├── ProductDetailPage  # /products/:id
│   ├── ProductsPage       # /products
│   └── SettingsPage       # /settings — own passkeys + API keys
└── utils/
    ├── index.ts           # Barrel exports
    └── formatters.ts      # formatSignificant, formatServingSize
```

## Authentication

### Overview

The app uses cookie-based authentication with the RecipeAPI backend. All fetch calls include `credentials: 'include'` so the `recipe-token` httpOnly cookie is sent automatically.

### AuthContext (`src/contexts/AuthContext.tsx`)

`AuthProvider` wraps the entire app (inside `BrowserRouter`). It provides:

```tsx
const { isAuthenticated, user, isLoading, login, loginWithPasskey, logout } = useAuth();
```

- On mount: calls `GET /auth/me` to check existing session (cookie)
- `login(username, password)` — API key login via `POST /auth/login`
- `loginWithPasskey(username?)` — WebAuthn login via begin/finish flow using `@simplewebauthn/browser`
- `logout()` — calls `POST /auth/logout`, clears state
- Listens for `auth:unauthorized` custom event (dispatched by `api.ts` on 401) to clear auth state

### Route Protection

Routes are protected using layout route components:

```tsx
<Route path="/login" element={<LoginPage />} />
<Route element={<RequireAuth />}>
  {/* All authenticated routes */}
  <Route element={<RequireAdmin />}>
    {/* Admin-only routes */}
  </Route>
</Route>
```

- **RequireAuth** — redirects to `/login` if not authenticated, shows `PasskeySetupPrompt` for users without passkeys
- **RequireAdmin** — redirects to `/` if `user.isAdmin` is false

### PasskeySetupPrompt

Shown to authenticated users who have `hasPasskeys === false`:
- Prominent banner at top of protected pages
- "Set up now" triggers WebAuthn registration via `@simplewebauthn/browser`'s `startRegistration`
- "Remind me later" dismisses to `sessionStorage` (reappears next session)

### API Client Auth Functions (`src/api.ts`)

All API functions automatically include credentials. On 401 responses, a `CustomEvent('auth:unauthorized')` is dispatched before throwing.

Auth functions: `authLogin`, `authLoginBegin`, `authLoginFinish`, `authMe`, `authLogout`, `authListPasskeys`, `authAddPasskeyBegin`, `authAddPasskeyFinish`, `authDeletePasskey`, `authListAPIKeys`, `authCreateAPIKey`, `authRevokeAPIKey`

Admin functions: `adminListUsers`, `adminCreateUser`, `adminUpdateUser`, `adminDeleteUser`, `adminListUserPasskeys`, `adminDeleteUserPasskey`, `adminListUserAPIKeys`, `adminDeleteUserAPIKey`, `adminCreateUserAPIKey`

### Auth Pages

| Page | Route | Description |
|------|-------|-------------|
| LoginPage | `/login` | Two sections: passkey sign-in button + username/API key form |
| SettingsPage | `/settings` | Manage own passkeys and API keys |
| AdminUsersPage | `/admin/users` | List/create users, shows one-time temp API key on create |
| AdminUserDetailPage | `/admin/users/:id` | Edit user, manage their passkeys and API keys |

### Header

When authenticated: shows nav links, barcode search, and a user dropdown (username, Settings link, Sign out). Admins see an "Admin" nav link. When not authenticated: shows only the brand.

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
import {
  LoadingState, ErrorState, ContentUnavailableView,
  ListRow, DeleteButton, CopyButton, TypeToConfirmModal,
  Button, ModalBase, ModalHeader, ModalBody, ModalFooter,
} from '../components/common'

// Status displays
if (loading) return <LoadingState />
if (error) return <ErrorState message={error} />
if (!data) return <ContentUnavailableView icon="bi-box-seam" title="Not Found" />

// Semantic buttons
<Button variant="primary" onClick={save}>Save</Button>
<Button variant="outline-secondary" size="sm" onClick={cancel}>Cancel</Button>

// Modals with sub-components
<ModalBase onClose={handleClose} ariaLabelledBy="my-title">
  <ModalHeader onClose={handleClose} titleId="my-title">Edit Item</ModalHeader>
  <ModalBody>...</ModalBody>
  <ModalFooter><Button onClick={handleClose}>Done</Button></ModalFooter>
</ModalBase>

// List rows with consistent layout
<ListRow icon="bi-fingerprint" content={<strong>{name}</strong>} secondary={timestamp}>
  <DeleteButton ariaLabel={`Delete ${name}`} onClick={handleDelete} />
</ListRow>

// Clipboard copy
<CopyButton text={apiKey} />

// Destructive confirmation
<TypeToConfirmModal
  isOpen={!!deleteTarget}
  title="Delete Passkey"
  message="This will permanently delete this passkey."
  itemName={deleteTarget.name}
  confirmButtonText="Delete passkey"
  onConfirm={handleDelete}
  onCancel={() => setDeleteTarget(null)}
/>
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

Uses Bootstrap 5 utility classes exclusively — no custom CSS files. All styling is applied via Bootstrap's utility classes and component classes. When Bootstrap utilities cannot express a design requirement, use inline `style` attributes sparingly for specific dimensions or one-off adjustments. Dark mode is supported via Bootstrap's `data-bs-theme` attribute with automatic detection of `prefers-color-scheme`.
