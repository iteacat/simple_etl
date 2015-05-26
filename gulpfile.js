var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    del = require('del'),
    merge = require('merge-stream');

var sourceDirs = ['api', 'common', 'config', 'main'];
var testDirs = ['test'];
var destDir = 'build';
var main = destDir + '/main/index.js';

gulp.task('clean', function(callback) {
    del(destDir + '/**/*', callback);
});

gulp.task('jshint', function() {
    sourceDirs.concat(testDirs).forEach(function(dir) {
        gulp.src(dir + '/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
    });
});

gulp.task('build', ['jshint', 'clean'], function() {

    var tasks = sourceDirs.concat(testDirs).map(function(dir) {
        return gulp.src(dir + '/**/*.js', {base: '.'}).pipe(gulp.dest(destDir));
    });

    return merge(tasks);
});

gulp.task('test', ['build'], function() {
    var tasks = testDirs.map(function(dir) {
        return gulp.src(destDir + '/' + dir + '/**/*.test.js', {read: false})
                   .pipe(mocha({reporter: 'spec'}));
    });

    return merge(tasks);
});

gulp.task('default', ['build', 'test']);

