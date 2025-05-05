/** @type {import('lint-staged').Configuration} */
const config = {
  "*.{js,jsx,ts,tsx,astro}": ["eslint", "prettier --write"],
  "*.{mjs,cjs}": ["eslint"],
  "*.json": ["prettier --write"],
};

export default config;
