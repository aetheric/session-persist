/* globals require, module */

var gulp = require('gulp');
var utils = require('gulp-util');
var protobuf = require('gulp-protobufjs');

var config_dest = {
	cwd: __dirname + '../../src/main/proto'
};

module.exports = function() {
	return gulp.src('src/main/proto/*.proto')
		.pipe(protobuf())
		.pipe(gulp.dest('src/main/proto', config_dest))
		.on('error', utils.log);
};
