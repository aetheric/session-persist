/* global require */

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var nightwatch = require('gulp-nightwatch-headless');
var utils = require('gulp-util');
var mocha = require('gulp-mocha');
var protobuf = require('gulp-protobufjs');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');

gulp.task('proto', function() {
	return gulp.src('src/main/proto/*.proto')
		.pipe(protobuf())
		.pipe(gulp.dest('src/main/proto', {
			cwd: __dirname + '/src/main/proto'
		}))
		.on('error', utils.log);
});

gulp.task('client', [ 'proto' ], function() {

	return gulp.src('src/main/client/*.js')

		.pipe(browserify({
			debug: true,
			shim: {
				protobufjs: {
					path: 'node_modules/protobufjs/dist/ProtoBuf.noparse.js',
					exports: 'ProtoBuf'
				}
			}
		}))

		.pipe(rename({
			basename: 'client'
		}))

		.pipe(gulp.dest('dist'))

		.pipe(buffer())

		.pipe(sourcemaps.init({
			loadMaps: true
		}))

		.pipe(uglify())

		.pipe(rename({
			extname: '.min.js'
		}))

		.pipe(sourcemaps.write('.'))

		.pipe(gulp.dest('dist'))

		.on('error', utils.log);
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
