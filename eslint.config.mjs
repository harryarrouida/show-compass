import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat();

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.jsx"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "off",
      "@next/next/no-img-element": "off",
      "@next/next/no-head-element": "off",
      "@next/next/no-script-component-in-head": "off",
      "@next/next/no-sync-scripts": "off",
      "@next/next/no-before-interactive-script-outside-document": "off",
      "@next/next/no-document-import-in-page": "off",
      "@next/next/no-script-tag-for-ids": "off",
      "next/core-web-vitals": "off",
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      'import/no-anonymous-default-export': 'off',
      'react/jsx-no-useless-fragment': 'off',
      'react/jsx-no-constructed-context-values': 'off',
      'react/jsx-no-bind': 'off',
      'react/jsx-no-duplicate-props': 'off',
      'react/jsx-no-target-blank': 'off',
      'react/jsx-no-script-url': 'off',
      'react/jsx-no-useless-fragment': 'off',
    },
  },
];

