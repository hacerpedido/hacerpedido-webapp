module.exports = {
  env: {
    es2021: true,
    "shared-node-browser": true,
  "jest/globals": true
  },
  extends: ["plugin:@typescript-eslint/recommended", "eslint:recommended", "next/core-web-vitals", "prettier"],
  plugins: ["@typescript-eslint", "import", "prettier", "jest"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "import/no-extraneous-dependencies": 0,
    "import/order": [
      "error",
      {
        alphabetize: { caseInsensitive: true, order: "asc" },
        "newlines-between": "always-and-inside-groups",
        warnOnUnassignedImports: true,
      },
    ],
    "prettier/prettier": "error",
  },
};
