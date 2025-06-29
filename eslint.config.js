// @ts-check
import { resolve } from "node:path";
import eslint from "@eslint/js";
import { includeIgnoreFile } from "@eslint/compat";
import globals from "globals";
import tsEslint from "typescript-eslint";
import pluginAstro from "eslint-plugin-astro";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tsEslint.config(
  includeIgnoreFile(resolve(import.meta.dirname, ".gitignore")),
  eslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: { globals: globals.browser },
  },
  tsEslint.configs.recommended,
  pluginAstro.configs.recommended,
  {
    files: ["**/*.{jsx,tsx}"],
    ...reactHooks.configs["recommended-latest"],
    ...reactRefresh.configs.recommended,
    rules: { "react-refresh/only-export-components": "warn" },
  },
);
