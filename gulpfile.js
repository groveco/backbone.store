var babelify = require('babelify');
var browserify = require('browserify');
var gulp = require('gulp');
var derequire = require('gulp-derequire');
var Server = require('karma').Server;
var source = require('vinyl-source-stream');
var watchify = require('watchify');

gulp.task('test', function () {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    autoWatch: false,
    singleRun: true
  }, function (exitCode) {
    process.exit(exitCode);
  }).start();
});

gulp.task('tdd', function () {
  new Server({
    configFile: __dirname + '/karma.conf.js',
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
  b.transform(babelify, { presets: ['es2015'] });
  return b;
};

var bundleShare = function (b, outDir, outFile) {
  return b.bundle()
    .on('error', function(e) {
      console.log('ERROR:', message);
    })
    .pipe(source(outFile))
    .pipe(derequire())
    .pipe(gulp.dest(outDir));
};
