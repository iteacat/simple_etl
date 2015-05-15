var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    del = require('del');

var sourceDirs = ['api', 'common', 'config', 'main'];
var testDirs = ['test'];
var destDir = 'build';
var main = destDir + '/main/index.js';

gulp.task('test', function() {
    testDirs.forEach(function(dir) {
        return gulp.src(dir + '/**/*.js', {read: false})
                   .pipe(mocha({reporter: 'spec'}));
    });
});

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

gulp.task('copy', ['clean'], function() {
    sourceDirs.concat(testDirs) .forEach(function(dir) {
        gulp.src(dir + '/**/*.js', {base: '.'}).pipe(gulp.dest(destDir));
    });
});

gulp.task('build', ['jshint', 'test', 'clean', 'copy'], function(callback) {
    callback(); 
});

gulp.task('default', ['build']);

