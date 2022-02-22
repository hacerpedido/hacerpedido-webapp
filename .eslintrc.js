module.exports = {
  env: {
    es2021: true,
    "shared-node-browser": true,
  },
  extends: ["eslint:recommended", "next/core-web-vitals", "prettier"],
  plugins: ["import", "prettier"],
  parserOptions: {
    sourceType: "module",
  },
  rules: {
    "prettier/prettier": "error",
    "import/no-extraneous-dependencies": 0,
    "import/order":
      [
        "error",
        {
          alphabetize: { caseInsensitive: true, order: "asc" },
          "newlines-between": "always-and-inside-groups",
          warnOnUnassignedImports: true,
        },
      ]
  },
};
