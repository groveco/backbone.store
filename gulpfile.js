var babelify = require('babelify');
var browserify = require('browserify');
var gulp = require('gulp');
var remapify = require('remapify');
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
  var b = browserifyBundle('examples/simple/js/test.js');
  bundleShare(b, 'dist/', 'simple.js');
  b = browserifyBundle('examples/dashboard/js/index.js');
  return bundleShare(b, 'dist/', 'dashboard.js');
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
    fullPaths: true,
    debug: true
  });
  b.transform(babelify, { presets: ['es2015'] });
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