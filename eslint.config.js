import js from '@eslint/js'
import globals from 'globals'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import prettierConfig from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'

const sharedPlugins = {
  react: reactPlugin,
  'react-hooks': reactHooksPlugin,
  import: importPlugin,
  'jsx-a11y': jsxA11yPlugin,
}

const sharedLanguageOptions = {
  ecmaVersion: 'latest',
  sourceType: 'module',
  globals: {
    ...globals.browser,
    ...globals.es2021,
  },
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
}

const sharedSettings = {
  react: { version: 'detect' },
  'import/resolver': {
    node: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    typescript: true,
  },
}

const sharedRules = {
  // --- Airbnb-style core rules ---
  'no-var': 'error',
  'prefer-const': 'error',
  'prefer-template': 'error',
  'prefer-destructuring': ['error', { object: true, array: false }],
  'prefer-arrow-callback': 'error',
  'no-param-reassign': ['error', { props: false }],
  'no-console': 'warn',
  'no-nested-ternary': 'error',
  eqeqeq: ['error', 'always', { null: 'ignore' }],
  curly: ['error', 'multi-line'],
  'no-else-return': 'error',
  'arrow-body-style': ['error', 'as-needed'],
  'object-shorthand': 'error',
  'no-useless-return': 'error',
  'no-lonely-if': 'error',
  'prefer-spread': 'error',
  'no-unneeded-ternary': 'error',
  'default-param-last': 'error',
  'max-lines': ['warn', { max: 200, skipBlankLines: true, skipComments: true }],

  // --- Import rules ---
  'import/order': ['error', {
    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
    'newlines-between': 'always',
  }],
  'import/no-duplicates': 'error',
  'import/first': 'error',
  'import/newline-after-import': 'error',

  // --- React rules ---
  ...reactPlugin.configs.recommended.rules,
  ...reactHooksPlugin.configs.recommended.rules,
  'react/react-in-jsx-scope': 'off',
  'react/jsx-no-target-blank': 'error',
  'react/self-closing-comp': 'error',
  'react/jsx-boolean-value': ['error', 'never'],
  'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
  'react/no-array-index-key': 'warn',

  // --- Accessibility rules ---
  ...jsxA11yPlugin.configs.recommended.rules,
}

export default [
  js.configs.recommended,
  prettierConfig,
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: sharedPlugins,
    languageOptions: sharedLanguageOptions,
    settings: sharedSettings,
    rules: {
      ...sharedRules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-shadow': 'error',
      'react/prop-types': 'warn',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      ...sharedPlugins,
      '@typescript-eslint': tseslint.plugin,
    },
    languageOptions: {
      ...sharedLanguageOptions,
      parser: tseslint.parser,
      parserOptions: {
        ...sharedLanguageOptions.parserOptions,
        projectService: true,
      },
    },
    settings: sharedSettings,
    rules: {
      ...sharedRules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'react/prop-types': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
      },
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
]
