var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');
var coffee = require('gulp-coffee');
var gutil = require('gulp-util');

//  development

gulp.task('hello', function() {
  console.log('Hello Zell');
});

gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss
    .pipe(sass())
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});


gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
  })
})


// now this
gulp.task('watch', ['browserSync', 'sass'], function (){
  gulp.watch('app/scss/**/*.scss', ['sass']); 
  // Reloads the browser whenever HTML or JS files change
  gulp.watch('app/*.html', browserSync.reload); 
  gulp.watch('app/js/**/*.js', browserSync.reload); 
});

// or this
gulp.task('default', function (callback) {
  runSequence(['sass','browserSync', 'watch'],
    callback
  )
});


gulp.task('coffee', function() {
  gulp.src('app/coffee/**/*.coffee')
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('dist/js'));
});

// optimizing

gulp.task('useref', function(){
  return gulp.src('app/*.html')
    .pipe(useref())
    .pipe(gulpIf('*.js', uglify()))
    // Minifies only if it's a CSS file
    .pipe(gulpIf('*.css', cssnano()))
    .pipe(gulp.dest('dist'))
});

gulp.task('images', function(){
  return gulp.src('app/images/**/*.+(png|jpg|JPG|jpeg|gif|svg)')
  // Caching images that ran through imagemin
  .pipe(cache(imagemin({
      interlaced: true
    })))
  .pipe(gulp.dest('dist/images'))
});

gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
});

// to clean/delete the files in the dist folder
gulp.task('clean:dist', function() {
  return del.sync('dist');
});

// to clear the images in the cache in the local system
gulp.task('cache:clear', function (callback) {
return cache.clearAll(callback)
});

// not good: all the tasks here run at the same time simultaneously, note cleaning and copying.
// gulp.task('build', [`clean:dist`, `sass`, `useref`, `images`, `fonts`], function (){
//   console.log('Building files');
// });

gulp.task('build', function (callback) {
  runSequence('clean:dist', 
    ['sass', 'useref', 'images', 'fonts'],
    callback
  )
});