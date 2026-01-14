/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    // Handle pnpm's .pnpm directory structure
    'node_modules/(?!(.pnpm|((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@tanstack/.*|@trpc/.*|zustand))',
    // Handle .pnpm symlinked packages
    'node_modules/.pnpm/(?!(react-native|@react-native|expo|@expo|react-navigation|@react-navigation|@tanstack|@trpc|zustand))',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@lib/(.*)$': '<rootDir>/lib/$1',
    '^@stores/(.*)$': '<rootDir>/stores/$1',
    '^@constants/(.*)$': '<rootDir>/constants/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'stores/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
  ],
  // Use node-based test environment
  testEnvironment: 'node',
  // Handle workspace packages
  moduleDirectories: ['node_modules', '../../node_modules'],
}
