/** @type {import('lint-staged').Configuration} */
const config = {
  "*.{js,jsx,ts,tsx}": ["eslint", "prettier --write"],
  "*.{mjs,cjs}": ["eslint"],
  "*.json": ["prettier --write"],
};

export default config;
