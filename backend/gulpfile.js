var gulp = require('gulp');
var build = require('../build/dist');

var dependencies = ['../api', '../inject', '../logcat', '../meow'];
var dependencies_dstdir = 'node_modules';

gulp.task('default', function () {
    return gulp.src(dependencies).pipe(build.syncDependency(dependencies_dstdir));
});