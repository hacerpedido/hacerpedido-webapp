/** @type {import("@jest/types").Config} */
module.exports = {
  // Use the package name so depcheck can account for Jest 30's separately
  // installed environment instead of reporting it as unused in CI.
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["<rootDir>/tests/e2e/"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
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
    "^.+\\.[jt]sx?$": [
      "babel-jest",
      {
        presets: [["next/babel", { "preset-react": { runtime: "automatic" } }]],
      },
    ],
  },
  coverageThreshold: {
    "./app/api/images/route.ts": {
      branches: 75,
      functions: 100,
      lines: 90,
      statements: 90,
    },
    "./app/api/shop/editor/route.ts": {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};
