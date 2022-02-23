module.exports = {
  transform: {
    "^.+\\.(ts)$": "ts-jest",
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
  },
};
