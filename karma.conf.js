module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],

    frameworks: ['browserify', 'mocha'],

    files: [
      './public/javascripts/tests/**/test-*.js'
    ],

    preprocessors: {
      './public/javascripts/tests/**/test-*.js': ['browserify']
    },

    browserify: {
      transform: [['babelify', {presets: ['es2015']}]],
      debug: true
    },

    autoWatch: false,
    singleRun: true
  });
};
