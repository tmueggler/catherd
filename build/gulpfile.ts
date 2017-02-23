import {task, src} from "gulp";
import {runNpmScript} from "./src/gulp.plugins";

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
    return src(MODULES, {read: false})
        .pipe(runNpmScript('build'));
});

task('compile', () => {
    return src(MODULES, {read: false})
        .pipe(runNpmScript('compile'));
});

task('clean', () => {
    return src(MODULES, {read: false})
        .pipe(runNpmScript('clean'));
});

const START_MODULES = [
    MODULE_BACKEND,
    MOUDLE_FRONTEND,
    MODULE_GATEWAY
];

task('start', () => {
    return src(START_MODULES, {read: false})
        .pipe(runNpmScript('start'));
});