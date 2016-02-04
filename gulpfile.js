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

gulp.task('watchify', function() {
  var b = browserify('src/index.js', {
    fullPaths: true,
    debug: true,
    standalone: 'BackboneStore'
  });
  b.external('jquery');
  b.transform(babelify, { presets: ['es2015'] });
  b.transform('browserify-shim');
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

var bundleShare = function (b) {
  return b.bundle()
    .on('error', function(e) {
      console.log('ERROR: ' + e.message);
    })
    .pipe(source('backbone-store.js'))
    .pipe(gulp.dest('dist/'));
};