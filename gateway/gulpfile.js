var gulp = require('gulp');
var build = require('../build/dist/@catherd/build');

var dependencies = ['../api/dist'];
var dependencies_dstdir = 'node_modules';

gulp.task('default', function () {
    return gulp.src(dependencies).pipe(build.syncDependency(dependencies_dstdir));
});