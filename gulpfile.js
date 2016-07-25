/* eslint-env node */
var _ = require('underscore');
var gulp = require('gulp');
var Server = require('karma').Server;

function karmaServer(config) {
  var configFile = __dirname + '/karma.conf.js';
  new Server(_.defaults(config || {}, {configFile})).start();
}

gulp.task('test', () => karmaServer({
  autoWatch: false,
  singleRun: true
}));

gulp.task('tdd', () => karmaServer());
