/** Values substituted into `{{placeholder}}` slots in a message. */
export type TranslationValues = Record<string, string | number>;

/**
 * A section of the catalog translated into one language.
 *
 * Typing a translated section as `Translations<typeof enSection>` makes a missing or
 * misspelled key a compile error instead of a message that silently falls back to English.
 */
export type Translations<Section> = Record<keyof Section, string>;
