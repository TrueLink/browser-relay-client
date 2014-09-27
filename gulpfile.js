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
        "bundle", 
        "finalize",
        done);
});

gulp.task('clean', function () {
    return gulp.src([
        'dist/**/*.js',
        'dist/**/*.map',
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
        noLib: true, 
        outDir: 'lib',
    });

    var result = gulp
        .src([
            'src/**/*.ts', 
            'typings/**/*.d.ts'
            ])
        .pipe(compiler)
        ;
    
    var filterPatterns = [
        '**/event.*',
        '**/protocol.*',
        '**/connection-manager.*',
        '**/routing.*',
        '**/index.*',
        ];

    var dtsLibFilter = gulpFilter(filterPatterns);
    var jsLibFilter = gulpFilter(filterPatterns);

    result.dts
        .pipe(dtsLibFilter)
        .pipe(gulp.dest('lib'))
        .pipe(dtsLibFilter.restore())
        .pipe(gulp.dest('dist'))
        ;

    return result.js
        .pipe(jsLibFilter)
        .pipe(gulp.dest('lib'))
        .pipe(jsLibFilter.restore())
        .pipe(gulp.dest('temp'))
        ;
});

gulp.task('bundle', function () {
    return gulp.src("temp/app.js")
        .pipe(browserify({
            insertGlobals: true,
            debug: true,
        }))
        .pipe(rename("index.js"))
        .pipe(gulp.dest('dist'))
        ;
});

gulp.task('finalize', function() {
    return gulp.src("temp")
        .pipe(rimraf({ force: true }));
});

// gulp.task('spa', ['compile'], function () {
//     spa.from_config("spa.yaml").build();
// });