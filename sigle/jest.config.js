const nextJest = require('next/jest');

const createJestConfig = nextJest();

// Any custom config you want to pass to Jest
const customJestConfig = {
  resolver: '<rootDir>/src/jest/resolver.js',
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
  // Exclude e2e playwright tests from Jest
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
  testEnvironment: 'jsdom',
};

// createJestConfig is exported in this way to ensure that next/jest can load the Next.js configuration, which is async
module.exports = createJestConfig(customJestConfig);
