module.exports = {
  extends: [
    "next",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:jest/all",
    "plugin:prettier/recommended",
  ],
  plugins: ["@typescript-eslint", "import", "prettier", "jest", "cypress"],
  parser: "@typescript-eslint/parser",
  // parserOptions: {
  //   sourceType: "module",
  // },
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    // "import/no-extraneous-dependencies": 0,
    "import/order": [
      "error",
      {
        alphabetize: { caseInsensitive: true, order: "asc" },
        "newlines-between": "always-and-inside-groups",
        warnOnUnassignedImports: true,
      },
    ],
    "prettier/prettier": "error",
    "jest/prefer-expect-assertions": 0,
  },
}
