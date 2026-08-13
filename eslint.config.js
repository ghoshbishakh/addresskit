export default [
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "**/.turbo/**",
      "**/*.json",
      "**/packages/data/src/data/**",
      "**/packages/providers/dr5hn/src/data/states/**",
    ],
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
