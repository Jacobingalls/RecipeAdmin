# Writing Style Guide

This guide covers all user-facing text in RecipeAdmin. Every string a user reads should follow these principles.

## Voice and tone

Write as a helpful friend who respects your time. Keep it simple, friendly, professional, and gently encouraging.

- Use second person ("you", "your")
- Always use contractions ("can't", "won't", "it's")
- Be concise — say what's needed, nothing more

## Capitalization

Use sentence case everywhere: headings, labels, section headers, button text, empty states.

- **Do**: "Daily nutrition", "No products", "Account actions"
- **Don't**: "Daily Nutrition", "No Products", "Danger Zone"

Proper nouns and acronyms keep their casing ("API key", "WebAuthn").

## Headings and labels

Headings describe the content, not the action. Keep them short and scannable.

- **Do**: "Profile", "Credentials", "Sessions"
- **Don't**: "Your Profile Settings", "Manage Your Credentials"

## Empty states

Provide a helpful nudge with actionable guidance. Don't use "yet" — it implies the user is behind.

There are two kinds of empty states:

**"Nothing here" states** — the user did something (searched, navigated) but there's no content to show. Title says what's missing; description suggests what to try.

- **Do**: "No products" / "Try adjusting your search or filters."
- **Do**: "No history" / "Log something to see it here."
- **Don't**: "No products yet" / "You haven't added any products yet."

**"Ready to start" states** — the user just arrived and hasn't taken action yet. Title says what they can do; description points them to the UI element that gets them started.

- **Do**: "Search products and groups" / "Use the search box above to get started."
- **Don't**: "No search query" / "Type a query to search." (describes system state, not the user's goal)
- **Don't**: "Search" (too vague — what can they search?)

## Error messages

Use a friendly summary and suggest an action. Start with "Couldn't" or "Something went wrong", not "Failed to" or "Error:".

- **Do**: "Couldn't save your changes. Try again."
- **Do**: "Something went wrong registering your passkey. Try again."
- **Don't**: "Failed to save changes"
- **Don't**: "Error: save operation failed"

## Destructive actions

Be gently cautious. Use "remove" for reversible actions and "delete" for permanent ones. Type-to-confirm for permanent deletes.

- **Do**: "This will permanently delete this user and all their data. This can't be undone."
- **Don't**: "WARNING: This action is irreversible!"

## In-progress buttons

When an action is loading, show a spinner inside the button but keep the original label. This preserves the button's size and keeps the context clear.

Use the `Button` component's `loading` prop:

```tsx
<Button loading={isSaving}>Save</Button>
```

Don't change button text to "Saving..." or "Processing...".

## Exclamation marks

Use them occasionally for warmth in success feedback — "Logged!", "Copied!" are fine. Don't use them in errors, warnings, or headings.

## Placeholders

- Search fields use an action verb: "Search products..." — exception: a global search box that covers everything can use just "Search..."
- Identity fields use examples: "e.g. jacob@example.com"

## Greetings

Use time-aware greetings on the home page:

- Before noon: "Good morning, {name}"
- Noon to 5 PM: "Good afternoon, {name}"
- After 5 PM: "Good evening, {name}"

## Explaining the why

When something needs explanation, tell the user *why* it matters, not just what happened.

- **Do**: "Make sure to save this key somewhere safe. It acts as your password and can't be retrieved once you close this dialog."
- **Don't**: "Copy your new API key now. For security, it won't be shown again."

## Success feedback

Use toast or banner notifications for success. Keep them brief and warm.

- **Do**: "Display name updated."
- **Do**: "Logged!"

## Accessibility copy

- Write meaningful `alt` text that describes the image's purpose, not its appearance
- Use `aria-label` to describe the action, not the element: `aria-label="Delete passkey My Mac"` not `aria-label="Delete button"`
- Screen reader announcements for loading states should use `aria-busy="true"` with a visually hidden "Loading" label
- Keep `aria-live` regions concise — announce the result, not the process
