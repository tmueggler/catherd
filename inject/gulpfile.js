let gulp = require('gulp');

gulp.task('webCopyDeclarations', function () {
    gulp.src('dist/es6/**/*.d.ts')
        .pipe(gulp.dest('dist/web'));
});