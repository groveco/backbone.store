module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],

    frameworks: ['browserify', 'mocha', 'chai', 'sinon'],

    reporters: ['mocha'],

    files: [
      'src/tests/**/test-*.js'
    ],

    preprocessors: {
      'src/tests/**/test-*.js': ['browserify']
    },

    browserify: {
      debug: true,
      transform: [
        ['babelify']
      ],
    }
  });
};
