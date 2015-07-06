/* globals require, module */

var gulp = require('gulp');
var path = require('path');
var rename = require('gulp-rename');
var utils = require('gulp-util');
var protobuf = require('gulp-protobufjs');

module.exports = function() {
	return gulp.src('src/main/proto/*.proto')

		.pipe(protobuf({
			input: 'protobuf',
			target: 'json'
		}))

		.pipe(rename({
			extname: '.json'
		}))

		.pipe(gulp.dest('src/main/proto', {
			cwd: path.join(__dirname, '..', 'main', 'proto')
		}))

		.on('error', utils.log);

};
