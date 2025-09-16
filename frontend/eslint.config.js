/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    ignores: ['node_modules/**', '.next/**', 'out/**', 'dist/**']
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn'
    }
  }
];
