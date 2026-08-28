module.exports = {
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:react-native/all", "prettier", "prettier/react"],
  plugins: ["import", "react-native", "prettier"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    es6: true,
    jest: true,
    node: true,
  },
  rules: {
    "react/display-name": 0,
    "react/prop-types": 0,
    "import/order": 1,
    "import/newline-after-import": 1,
    "import/no-anonymous-default-export": 0,
    "react-native/no-inline-styles": "warn",
    "react-native/no-color-literals": "warn",
    "react-native/no-unused-styles": "warn",
    "react-native/sort-styles": "warn",
  },
  settings: {
    react: {
      version: "16.13",
    },
    "import/ignore": ["react-native"],
    "import/resolver": {
      node: {
        paths: ["src"],
        extensions: [".js", ".jsx"],
      },
    },
  },
};
