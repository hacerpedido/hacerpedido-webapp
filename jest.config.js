module.exports = {
  moduleNameMapper: {
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
};
