var gulp = require('gulp');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss'),
  sourcemaps = require('gulp-sourcemaps'),
  lost = require('lost');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var cp = require('child_process');

var messages = {
  jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

function swallowError(error) {
  // If you want details of the error in the console
  console.log(error.toString());
  this.emit('end');
}

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function(done) {
  browserSync.notify(messages.jekyllBuild);
  return cp.spawn('jekyll', ['build'], {
      stdio: 'inherit'
    })
    .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function() {
  browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
  browserSync({
    server: {
      baseDir: '_site'
    }
  });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function() {
  return gulp.src('_scss/main.scss')
    .pipe(plumber(function(error) {
      gutil.log(error.message);
      this.emit('end');
    }))
    .pipe(sass({
      includePaths: ['scss'],
      onError: browserSync.notify
    }))
    .pipe(sourcemaps.init())
    .pipe(postcss([
      lost()
    ]))
    .pipe(sourcemaps.write('./'))
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
      cascade: true
    }))
    .pipe(gulp.dest('_site/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe(gulp.dest('css'));
});

/** not used 
 */
gulp.task('images', function() {
  return gulp.src('_images/*')
  .pipe(gulp.dest('_site/images'));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function() {
  gulp.watch('_scss/*.scss', ['sass']);
  gulp.watch(['*.html', '_layouts/*.html', 'pages/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);