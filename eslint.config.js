import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import { includeIgnoreFile } from "@eslint/compat";
import tsEslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintPluginAstro from "eslint-plugin-astro";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const gitignorePath = resolve(__dirname, ".gitignore");

export default defineConfig([
  includeIgnoreFile(gitignorePath),
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  tsEslint.configs.recommended,
  {
    files: ["**/*.{jsx,tsx}"],
    settings: { react: { version: "detect" } },
    ...pluginReact.configs.flat.recommended,
  },
  ...eslintPluginAstro.configs.recommended,
]);
