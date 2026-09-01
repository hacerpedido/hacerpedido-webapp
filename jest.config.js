/** @type {import("@jest/types").Config} */
module.exports = {
  testPathIgnorePatterns: ["<rootDir>/tests/e2e/"],
  moduleNameMapper: {
    "^.+\\.module\\.css$": "<rootDir>/tests/styleMock.js",
    "^#assets/(.*)$": "<rootDir>/assets/$1",
    "^#components/(.*)$": "<rootDir>/components/$1",
    "^#db/(.*)$": "<rootDir>/db/$1",
    "^#lib/(.*)$": "<rootDir>/lib/$1",
    "^#pages/(.*)$": "<rootDir>/pages/$1",
    "^#tests/(.*)$": "<rootDir>/tests/$1",
  },
  transform: {
    "^.+\\.[jt]sx?$": ["babel-jest", { presets: ["next/babel"] }],
  },
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};
