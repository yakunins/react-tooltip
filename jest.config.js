module.exports = {
  // Node by default; DOM specs opt in with a `@jest-environment jsdom` docblock.
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.spec.{ts,tsx}'],
  setupFiles: ['<rootDir>/test/setup.ts'],
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '!<rootDir>/src/**/*.stories.tsx',
    '!<rootDir>/src/types/**/*.ts',
  ],
  transform: {
    '^.+\.[tj]sx?$': [
      'ts-jest',
      {
        diagnostics: false,
        tsconfig: { allowJs: true, jsx: 'react-jsx' },
      },
    ],
  },
};
