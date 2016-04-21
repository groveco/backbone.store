var babelify = require('babelify');
var browserify = require('browserify');
var browserifyShim = require('browserify-shim');
var gulp = require('gulp');
var Server = require('karma').Server;
var source = require('vinyl-source-stream');
var watchify = require('watchify');

gulp.task('karma', function () {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, function (exitCode) {
    process.exit(exitCode);
  }).start();
});

gulp.task('browserify', function () {
  var b = browserifyBundle('src/index.js');
  bundleShare(b, 'dist/', 'main.js');
});

gulp.task('watchify', function() {
  var b = browserifyBundle();
  var w = watchify(b, {
    poll: true
  });
  w.on('update', function() {
    console.log('Bundling...');
    bundleShare(w);
  });
  w.on('time', function (time) {
    console.log('Bundled in ' + time + 'ms');
  });
  return bundleShare(w);
});

var browserifyBundle = function (sourcePath) {
  var b = browserify(sourcePath, {
    standalone: 'BackboneStore'
  });
  b.exclude('jquery');
  b.exclude('underscore');
  b.exclude('backbone');
  b.exclude('rsvp');
  b.external('es6-symbol');
  b.transform(babelify, { presets: ['es2015'] });
  b.transform(browserifyShim);
  return b;
};

var bundleShare = function (b, outDir, outFile) {
  return b.bundle()
    .on('error', function(e) {
      console.log('ERROR: ' + e.message);
    })
    .pipe(source(outFile))
    .pipe(gulp.dest(outDir));
};