/* global require */

var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('test', function() {
	return gulp.src('src/test/**/*.spec.js');
});

gulp.task('dist', function() {
	return gulp.src('src/main/**/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});

