module.exports = {
  extends: [
    "react-app",
    "plugin:react-native/all",
    "plugin:prettier/recommended",
    "prettier/react",
  ],
  plugins: [
    "react-native",
    "prettier",
  ],
  rules: {
    "react/display-name": 0,
    "react/prop-types": 0,
  }
};
