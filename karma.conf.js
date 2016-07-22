module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],

    frameworks: ['browserify', 'mocha', 'chai-spies', 'chai', 'sinon'],

    files: [
      'src/tests/**/test-*.js'
    ],

    preprocessors: {
      'src/tests/**/test-*.js': ['browserify']
    },

    browserify: {
      transform: [['babelify', {presets: ['es2015']}]],
      debug: true,
      configure: function (b) {
        b.on('prebundle', function () {
          b.require('./node_modules/underscore/underscore.js', {expose: 'underscore'});
        });
      }
    },
  });
};
