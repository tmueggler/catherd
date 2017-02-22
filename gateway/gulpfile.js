var gulp = require('gulp');
var depsync = require('../gulp-dependencies/src/sync/gulp-dependencies-sync');

var dependencies = ['../api/dist'];
var dependencies_dstdir = 'node_modules';

gulp.task('default', function () {
    gulp.src(dependencies).pipe(depsync(dependencies_dstdir));
});