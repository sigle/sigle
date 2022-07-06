const nextJest = require('next/jest');

const createJestConfig = nextJest();

// Any custom config you want to pass to Jest
const customJestConfig = {
  resolver: '<rootDir>/src/jest/resolver.ts',
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
  testEnvironment: 'jsdom',
};

// createJestConfig is exported in this way to ensure that next/jest can load the Next.js configuration, which is async
module.exports = createJestConfig(customJestConfig);
