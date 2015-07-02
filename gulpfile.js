/* global require */

var gulp = require('gulp');

gulp.task('proto', require('./src/gulp/proto'));
gulp.task('build', [ 'proto' ], require('./src/gulp/build'));
gulp.task('test', [ 'build' ], require('./src/gulp/test'));
