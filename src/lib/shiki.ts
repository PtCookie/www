// Shared between astro.config.mjs's markdown.shikiConfig.themes (used while these were still
// build-time markdown code fences) and src/components/portable-text/Code.astro (which highlights
// EmDash's Portable Text code blocks at request time) — both need the exact same theme pair so
// dark/light output matches regardless of which pipeline rendered a given code block.
//
// `light` is catppuccin-macchiato and `dark` is catppuccin-latte: this looks swapped but is
// intentional, chosen for code-block readability (see AGENTS.md).
export const shikiThemes = {
  light: "catppuccin-macchiato",
  dark: "catppuccin-latte",
} as const;
