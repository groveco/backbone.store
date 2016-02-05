module.exports = function (config) {
  config.set({
    browsers: ['PhantomJS'],

    frameworks: ['browserify', 'mocha', 'chai-spies', 'chai', 'sinon'],

    files: [
      './node_modules/jquery/dist/jquery.js',
      './node_modules/underscore/underscore.js',
      './node_modules/backbone/backbone.js',
      './node_modules/rsvp/dist/rsvp.js',
      'src/tests/**/test-*.js'
    ],

    preprocessors: {
      'src/tests/**/test-*.js': ['browserify']
    },

    browserify: {
      transform: [['babelify', {presets: ['es2015']}], 'browserify-shim'],
      debug: true,
      configure: function (b) {
        b.on('prebundle', function () {
          b.require('./node_modules/underscore/underscore.js', {expose: 'underscore'});
        });
      }
    },

    autoWatch: false,
    singleRun: true
  });
};
