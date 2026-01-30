const react = require('eslint-plugin-react')
const typescriptEslint = require('@typescript-eslint/eslint-plugin')
const typescriptParser = require('@typescript-eslint/parser')
const unusedImports = require('eslint-plugin-unused-imports')
const prettier = require('eslint-plugin-prettier')
const prettierConfig = require('eslint-config-prettier')
const globals = require('globals')

module.exports = [
  {
    ignores: ['node_modules/**', 'build/**', 'dist/**', '*.config.js', '*.config.ts']
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021
      }
    },
    plugins: {
      react,
      '@typescript-eslint': typescriptEslint,
      'unused-imports': unusedImports,
      prettier
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      ...prettierConfig.rules,
      ...react.configs.recommended.rules,
      ...typescriptEslint.configs.recommended.rules,
      // Disable React import requirement (React 17+ doesn't need it)
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'off',
      'prettier/prettier': 'error',
      quotes: ['error', 'single'],
      '@typescript-eslint/no-unused-vars': 'warn'
    }
  },
  {
    files: ['**/__tests__/**/*', '**/*.{spec,test}.*'],
    languageOptions: {
      globals: {
        ...globals.jest
      }
    }
  }
]
