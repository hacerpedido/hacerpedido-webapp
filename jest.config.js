const nextJest = require("next/jest")

const createJestConfig = nextJest()

// Any custom config you want to pass to Jest
const customJestConfig = {
  preset: "react-native-web",
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleDirectories: ["node_modules", "."],
  transformIgnorePatterns: ["/next[/\\\\]dist/", "/\\.next/"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/pages/(.*)$": "<rootDir>/pages/$1",
    "^@/store/(.*)$": "<rootDir>/store/$1",
  },
}

// createJestConfig is exported in this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
