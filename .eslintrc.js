module.exports = {
  extends: ["react-app", "plugin:react-native/all", "prettier", "prettier/react"],
  plugins: ["react-native", "prettier"],
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
    "import/ignore": ["react-native"],
    "import/resolver": {
      node: {
        paths: ["src"],
        extensions: [".js", ".jsx"],
      },
    },
  },
};