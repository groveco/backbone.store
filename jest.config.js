module.exports = {
  testURL: 'http://localhost',
  testMatch: ['**/*.spec.js'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  collectCoverage: true,
  coverageDirectory: './coverage',
  testResultsProcessor: 'jest-junit'
}
