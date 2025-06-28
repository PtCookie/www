// @ts-check
import { resolve } from "node:path";
import { FlatCompat } from "@eslint/eslintrc";
import { includeIgnoreFile } from "@eslint/compat";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  includeIgnoreFile(resolve(import.meta.dirname, ".gitignore")),
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
