var gulp = require('gulp');
var ts = require('gulp-typescript');
var gulpFilter = require('gulp-filter');
var rimraf = require('gulp-rimraf');
var browserify = require('gulp-browserify');
var runSequence = require('run-sequence');
var rename = require("gulp-rename");

gulp.task('default', function(done) {
    runSequence(
        "clean", 
        "compile", 
        done);
});

gulp.task('clean', function () {
    return gulp.src([
        'lib/**/*.js',
        'lib/**/*.d.ts',
        ], { read: false })
    .pipe(rimraf({ force: true }));
});

gulp.task('compile', function () {
    var compiler = ts({
        declarationFiles: true,
        noExternalResolve: false,
        module: 'commonjs',
        target: 'ES5',
        noImplicitAny: true, 
        noLib: false, 
        outDir: 'lib',
    });

    var result = gulp
        .src([
            'src/**/*.ts', 
            'typings/**/*.d.ts'
            ])
        .pipe(compiler)
        ;

    result.dts
        .pipe(gulp.dest('lib'))
        ;

    return result.js
        .pipe(gulp.dest('lib'))
        ;
});
