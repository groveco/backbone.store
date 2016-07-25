module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],

    frameworks: ['browserify', 'mocha', 'chai', 'sinon'],

    reporters: ['mocha'],

    files: [
      'tests/**/test-*.js'
    ],

    preprocessors: {
      'tests/**/test-*.js': ['browserify']
    },

    browserify: {
      debug: true,
      transform: [
        ['babelify']
      ],
    }
  });
};
