module.exports = {
  plugins: ["prettier"],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: "detect", // Automatically detect the react version
    },
    "import/resolver": {
      node: {
        paths: ["./"],
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
    "prettier",
  ],
  rules: {
    "import/newline-after-import": "error",
    "import/no-anonymous-default-export": 0,
    "import/no-unresolved": [2, { ignore: ["react-native"] }],
    "import/order": ["error", { "newlines-between": "always" }],
    "prettier/prettier": "error",
    "react-native/no-color-literals": "warn",
    "react-native/no-inline-styles": "warn",
    "react-native/no-unused-styles": "warn",
    "react-native/sort-styles": "warn",
    "react/display-name": 0,
    "react/prop-types": 0,
    "react/react-in-jsx-scope": "off",
  },
};
