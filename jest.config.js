module.exports = {
  collectCoverage: true,
  testMatch: ['**/*.spec.js'],
  coverageDirectory: './coverage',
  transform: {
    '^.+\\.[jt]sx?$': require.resolve('babel-jest')
  },
  reporters: [
    'default',
    'jest-junit'
  ],
  testURL: 'http://localhost/'
}
