import {task, src} from "gulp";
import {runNpmScript} from "./gulp.plugins";

const MOULE_GULP = '../gulp-dependencies';
const MODULE_API = '../api';
const MODULE_BACKEND = '../backend';
const MOUDLE_FRONTEND = '../frontend';
const MODULE_GATEWAY = '../gateway';

const MODULES = [
    MOULE_GULP,
    MODULE_API,
    MODULE_BACKEND,
    MOUDLE_FRONTEND,
    MODULE_GATEWAY
];

task('build', () => {
    return src(MODULES)
        .pipe(runNpmScript('build'));
});

task('compile', () => {
    return src(MODULES)
        .pipe(runNpmScript('compile'));
});

task('clean', () => {
    return src(MODULES)
        .pipe(runNpmScript('clean'));
});

const START_MODULES = [
    MODULE_BACKEND,
    MOUDLE_FRONTEND,
    MODULE_GATEWAY
];

task('start', () => {
    return src(START_MODULES)
        .pipe(runNpmScript('start'));
});