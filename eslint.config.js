// Minimal ESLint 9 flat config so `trunk check` can run eslint.
// Extend with typescript-eslint and eslint-plugin-vue as needed.
module.exports = [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.trunk/**",
      "**/coverage/**",
    ],
  },
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs", "**/*.ts", "**/*.vue"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {},
    },
    rules: {},
  },
];
