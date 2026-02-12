# Refactoring Plan

Incremental improvements to reduce component complexity, eliminate duplication, and build a consistent shared component library.

Track progress by checking off items as PRs land.

## Tier 1: Shared Primitives (High ROI)

These small, focused components eliminate the most duplication across the codebase.

- [x] **`DeleteButton`** — Circular icon-only button for destructive actions in list rows (passkey rows, API key rows, session rows). Currently copy-pasted with identical inline styles (`width: 2rem`, `height: 2rem`, hover variables) in `SettingsPage`, `AdminUserDetailPage`, and session rows. Extract once, use everywhere.

- [x] **`CopyButton`** — Button with "Copy" / "Copied!" feedback state. The same `useState` + `setTimeout` + `navigator.clipboard` pattern is repeated 6+ times across `SettingsPage`, `AdminUserDetailPage`, and `AdminUsersPage`. One component replaces ~25 lines per usage.

- [x] **`ListRow`** — Horizontal layout: `[icon] [primary content] [spacer] [secondary content] [actions]`. This pattern appears in passkey rows, API key rows, session rows, barcode rows, custom size rows, and history entries. A single composable component enforces consistent spacing, alignment, and accessibility.

- [x] **`TypeToConfirmModal`** (originally `ConfirmationModal`) — Modal with "type name to confirm" input for destructive actions. Appears identically 3 times (credential deletion in `SettingsPage`, credential deletion in `AdminUserDetailPage`, user deletion in `AdminUserDetailPage`). ~60 lines each, fully unified.

## Tier 2: Decompose Large Pages

Break 500+ line page components into focused section components.

- [x] **`SettingsPage` sections** — Split into `ProfileSection`, `CredentialsSection`, `CreateAPIKeyModal`, `SessionsSection` in `src/components/settings/`. Page is now a 93-line orchestrator.

- [x] **`AdminUserDetailPage` sections** — Split into `AdminUserProfileForm`, `AdminCredentialsSection`, `TempAPIKeyModal`, `DangerZoneSection` in `src/components/admin-user-detail/`. Page is now a 53-line orchestrator.

## Tier 3: Shared Modal & Data Patterns

- [x] **`ModalBase`** — Wrapper component providing modal backdrop, scroll lock, backdrop-click-to-dismiss, and ARIA attributes. Also exports `ModalHeader`, `ModalBody`, `ModalFooter` sub-components for standard modal sections. All modals in the app now use this shared component.

- [ ] **`useClipboard` hook** — Encapsulates `navigator.clipboard.writeText` + copied state + auto-reset timer. Used by `CopyButton` internally but also useful standalone.

- [x] **`useHistoryData` hook** — Shared data fetching and log entry resolution logic extracted from `HistoryPage` (373→175 lines) and `HistoryTile` (293→85 lines). Includes product/group lazy-loading, nutrition calculation, and all action handlers (log again, edit, delete).

## Tier 4: Consistent UI Patterns

- [x] **`SectionHeader`** — `[h5 title] [spacer] [action children]` layout used in `CredentialsSection`, `SessionsSection`, `AdminCredentialsSection`, `AdminUserProfileForm`, and `DangerZoneSection`. Standardizes spacing, heading level, and action placement.

- [x] **`CredentialRow`** — Specialized `ListRow` for passkeys and API keys. Handles icon selection (`bi-fingerprint`/`bi-key`), timestamp formatting (created vs expires), optional key prefix display, and delete action. Used in `CredentialsSection` and `AdminCredentialsSection`.

- [x] **`LinkListItem`** — List group item that renders as a `<Link>`. Simple mode: title (fw-bold) + subtitle. Trailing mode: flex layout with left title area + right trailing content. Used in `ProductsPage`, `GroupsPage`, `AdminUsersPage`.

- [x] **`InlineFormField`** — Local component in `AdminUserProfileForm` for the repeated horizontal label+input pattern. The two form layouts (horizontal list-group-item in `AdminUserProfileForm` vs vertical stacked in `AdminUsersPage`) are structurally different, so a shared `FormField` was not extracted. `InlineFormField` is file-local; will promote to shared if a second consumer emerges.

- [x] **`Button`** — Semantic wrapper around Bootstrap button classes with `variant` and `size` props. Eliminates raw `className="btn btn-*"` clusters across modals, forms, and action areas.

## Principles

1. **One component per file** — each extracted component gets its own file and test file
2. **Props over configuration** — prefer explicit props to feature flags or mode switches
3. **Composition over inheritance** — use `children` and render props, not deep prop drilling
4. **Extract when duplicated** — don't pre-extract; wait until a pattern appears 2+ times
5. **Tests accompany every extraction** — new components need tests, and existing page tests must still pass
