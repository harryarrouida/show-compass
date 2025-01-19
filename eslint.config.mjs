import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    extends: ['next'],
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
      '@next/next/no-img-element': 'off',
      '@next/next/no-head-element': 'off',
      '@next/next/no-script-component-in-head': 'off',
      '@next/next/no-sync-scripts': 'off',
      '@next/next/no-before-interactive-script-outside-document': 'off',
      '@next/next/no-document-import-in-page': 'off',
      '@next/next/no-script-tag-for-ids': 'off',
      '@next/next/no-script-tag-for-ids': 'off',
      
    }
  }
];

export default eslintConfig;
