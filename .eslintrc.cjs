/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    'next/core-web-vitals',
    'prettier'
  ],
  plugins: [
    '@typescript-eslint',
    'prettier',
    'security'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    // Core Security - Enterprise Grade
    'no-eval': 'error',
    'no-implied-eval': 'error', 
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-caller': 'error',
    'no-extend-native': 'error',
    
    // Manual Security Plugin Rules (Deep Security)
    'security/detect-object-injection': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-pseudoRandomBytes': 'error',
    'security/detect-possible-timing-attacks': 'warn',
    'security/detect-new-buffer': 'error',
    
    // TypeScript Security
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/ban-types': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // React Security
    'react/no-danger': 'error',
    'react/no-danger-with-children': 'error',
    'react/jsx-no-script-url': 'error',
    'react/jsx-no-target-blank': 'error'
  },
  env: {
    browser: true,
    es2021: true,
    node: true
  }
}