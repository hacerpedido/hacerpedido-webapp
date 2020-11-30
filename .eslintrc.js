/* eslint-env node */
module.exports = {
  plugins: ["react", "react-native", "prettier", "jest"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    node: true,
  },
  settings: {
    "import/ignore": ["react-native"],
    "import/resolver": {
      node: {
        paths: ["."],
        extensions: [".js", ".jsx"],
      },
    },
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-native/all",
    "plugin:react-hooks/recommended",
    "plugin:import/errors",
    "plugin:jest/recommended",
    "plugin:jest/style",
    "prettier",
    "prettier/react",
  ],
  rules: {
    "import/newline-after-import": "error",
    "import/no-anonymous-default-export": 0,
    "import/no-unresolved": [2, { ignore: ["react-native"] }],
    "import/order": [
      "error",
      {
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    "prettier/prettier": "error",
    "react-native/no-color-literals": "warn",
    "react-native/no-inline-styles": "warn",
    "react-native/no-raw-text": "warn",
    "react/prop-types": 0,
    "react/react-in-jsx-scope": "off",
  },
};
