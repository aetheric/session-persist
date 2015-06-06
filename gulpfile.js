/* global require */

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var nightwatch = require('gulp-nightwatch-headless');
var utils = require('gulp-util');
var mocha = require('gulp-mocha');
var ProtoBuf = require('protobufjs');
var rename = require('gulp-rename');
var through = require('gulp-through');

var ProtoParser = ProtoBuf.DotProto.Parser;

gulp.task('proto', function() {

	gulp.src('src/main/proto/*.proto')
		.pipe(through('proto', function(file) {
			var object = new ProtoParser(file.contents, file.path)
				.parse();
			file.contents = new Buffer(JSON.stringify(object));
		})())
		.pipe(rename({
			extname: '.json'
		}))
		.pipe(gulp.dest('dist'));

});

gulp.task('test', [
	'test-unit',
	'test-e2e'
]);

gulp.task('test-unit', function() {
	return gulp.src('src/test/**/*.spec.js').pipe(mocha({
	})).on('error', utils.log);
});

gulp.task('test-e2e', function() {
	return gulp.src('src/test/**/*.e2e.js').pipe(nightwatch({
		nightwatch: {
			tempDir: 'out/nightwatch',
			config: 'src/test/nightwatch.json'
		},
		httpserver: {
			port: 2043,
			path: 'out/nightwatch'
		},
		verbose: true
	})).on('error', utils.log);
});

gulp.task('dist', [ 'proto' ], function() {
	return gulp.src('src/main/**/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist'))
		.on('error', utils.log);
});

gulp.task('dist-proto', function() {
	gulp.src('node_modules/protobufjs/dist/protobuf.noparse.min.js')
		.pipe(gulp.dest('dist'));
});
