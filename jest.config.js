const nextJest = require("next/jest");
const createJestConfig = nextJest();

module.exports = createJestConfig({
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@quantum/(.*)$": "<rootDir>/lib/quantum/$1"
  },
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "lib/**/*.{ts,tsx}",
    "!**/*.d.ts"
  ]
});