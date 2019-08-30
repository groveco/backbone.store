module.exports = {
  testURL: 'http://localhost/',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['js'],
  setupFiles: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.spec.js'],
  collectCoverage: true,
  coverageDirectory: './coverage',
  testResultsProcessor: 'jest-junit'
}
