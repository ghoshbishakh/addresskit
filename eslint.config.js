export default [
  {
    ignores: ["**/dist/**", "**/node_modules/**"],
  },
  {
    rules: {
      "no-unused-vars": "error",
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
    },
  },
];
