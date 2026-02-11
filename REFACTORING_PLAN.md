# Refactoring Plan

Incremental improvements to reduce component complexity, eliminate duplication, and build a consistent shared component library.

Track progress by checking off items as PRs land.

## Tier 1: Shared Primitives (High ROI)

These small, focused components eliminate the most duplication across the codebase.

- [x] **`DeleteButton`** — Circular icon-only button for destructive actions in list rows (passkey rows, API key rows, session rows). Currently copy-pasted with identical inline styles (`width: 2rem`, `height: 2rem`, hover variables) in `SettingsPage`, `AdminUserDetailPage`, and session rows. Extract once, use everywhere.

- [x] **`CopyButton`** — Button with "Copy" / "Copied!" feedback state. The same `useState` + `setTimeout` + `navigator.clipboard` pattern is repeated 6+ times across `SettingsPage`, `AdminUserDetailPage`, and `AdminUsersPage`. One component replaces ~25 lines per usage.

- [x] **`ListRow`** — Horizontal layout: `[icon] [primary content] [spacer] [secondary content] [actions]`. This pattern appears in passkey rows, API key rows, session rows, barcode rows, custom size rows, and history entries. A single composable component enforces consistent spacing, alignment, and accessibility.

- [x] **`ConfirmationModal`** — Modal with "type name to confirm" input for destructive actions. Appears identically 3 times (credential deletion in `SettingsPage`, credential deletion in `AdminUserDetailPage`, user deletion in `AdminUserDetailPage`). ~60 lines each, fully unified.

## Tier 2: Decompose Large Pages

Break 500+ line page components into focused section components.

- [ ] **`SettingsPage` sections** — Currently 660 lines with 20+ state variables. Split into:
  - `ProfileSection` — display name viewing/editing
  - `CredentialsSection` — passkey + API key list with add dropdown
  - `CreateAPIKeyModal` — key creation form with expiry toggle
  - `SessionsSection` — session list with sign-out controls

- [ ] **`AdminUserDetailPage` sections** — Currently 582 lines. Split into:
  - `AdminUserProfileForm` — user profile editing form
  - `AdminCredentialsSection` — credential list with generate temp key button
  - `TempAPIKeyModal` — temporary key display with copy
  - `DangerZoneSection` — revoke sessions + delete user

## Tier 3: Shared Modal & Data Patterns

- [ ] **`ModalBase`** — Wrapper component providing modal backdrop, scroll lock, backdrop-click-to-dismiss, and ARIA attributes. Every modal in the app (8+ instances) duplicates this structure. Extract to:
  ```tsx
  <ModalBase isOpen={isOpen} onClose={onClose} labelledBy="modal-title">
    <ModalBase.Header>...</ModalBase.Header>
    <ModalBase.Body>...</ModalBase.Body>
    <ModalBase.Footer>...</ModalBase.Footer>
  </ModalBase>
  ```

- [ ] **`useClipboard` hook** — Encapsulates `navigator.clipboard.writeText` + copied state + auto-reset timer. Used by `CopyButton` internally but also useful standalone.

- [ ] **`useHistoryData` hook** — Shared data fetching and log entry resolution logic duplicated between `HistoryPage` (373 lines) and `HistoryTile` (293 lines). Includes product/group lazy-loading and nutrition calculation.

## Tier 4: Consistent UI Patterns

- [ ] **`SectionHeader`** — `[h5 title] [spacer] [action button/dropdown]` pattern used in every settings/admin section. Standardize spacing, heading levels, and action placement.

- [ ] **`CredentialRow`** — Specialized `ListRow` for passkeys and API keys with icon selection, timestamp formatting, expiry badges, and delete action. Used in `SettingsPage` and `AdminUserDetailPage`.

- [ ] **`LinkListItem`** — List group item that renders as a `<Link>` with consistent `[title + subtitle] [metadata]` layout. Used in `ProductsPage`, `GroupsPage`, `AdminUsersPage`.

- [ ] **`FormField`** — Consistent label + input wrapper for forms. Reduces boilerplate in user creation, API key creation, and profile editing forms.

## Principles

1. **One component per file** — each extracted component gets its own file and test file
2. **Props over configuration** — prefer explicit props to feature flags or mode switches
3. **Composition over inheritance** — use `children` and render props, not deep prop drilling
4. **Extract when duplicated** — don't pre-extract; wait until a pattern appears 2+ times
5. **Tests accompany every extraction** — new components need tests, and existing page tests must still pass
