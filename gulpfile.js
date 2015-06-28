/* global require */

var gulp = require('gulp');

gulp.task('proto', require('./src/gulp/proto'));
gulp.task('client', [ 'proto' ], require('./src/gulp/client'));
gulp.task('test', [ 'client' ], require('./src/gulp/test'));
