// ESLint 9 flat config for TypeScript

// Base JS rules
const js = require('@eslint/js');
const globals = require('globals');
// TS parser and plugin
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  // JS recommended (applies to all files unless overridden)
  js.configs.recommended,

  // TypeScript rules
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // For rules requiring type information, you can later add:
        // project: ['./tsconfig.json'],
        // tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.es2021,
        ...globals.node,
        fetch: 'readonly', // Node 18+
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // We take the set of rules from the recommended plugin configurator
      ...tsPlugin.configs.recommended.rules,
      // + TS specifics
      'no-undef': 'off', // TS catches undefined variables, otherwise false positives on types
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      // Optionally: temporarily relax
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];