/* eslint-env node */
module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],

    frameworks: ['browserify', 'mocha', 'chai'],

    reporters: ['mocha'],

    files: [
      'tests/**/test-*.js'
    ],

    preprocessors: {
      'src/**/*.js': ['eslint'],
      'tests/**/*.js': ['eslint'],
      'tests/**/test-*.js': ['browserify'],
    },

    eslint: {
      stopOnWarning: false,
      stopOnError: false,
    },

    browserify: {
      debug: true,
      transform: [
        ['babelify']
      ],
    },
  });

  if (process.env.CIRCLECI) {
    config.set({
      reporters: ['progress', 'junit'],
      junitReporter: {
        outputDir: process.env.CIRCLE_TEST_REPORTS + '/junit/',
        outputFile: 'test-results.xml',
        useBrowserName: false,
      }
    });
  }
};
