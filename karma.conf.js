module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],

    frameworks: ['browserify', 'mocha', 'chai-spies', 'chai'],

    files: [
      './public/javascripts/tests/**/test-*.js'
    ],

    preprocessors: {
      './public/javascripts/tests/**/test-*.js': ['browserify']
    },

    browserify: {
      transform: [['babelify', {presets: ['es2015']}]],
      debug: true,
      configure: function (b) {
        b.add(require.resolve('babel-polyfill'));
      }
    },

    autoWatch: false,
    singleRun: true
  });
};
