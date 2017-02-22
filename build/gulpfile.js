"use strict";
const gulp_1 = require("gulp");
const gulp_util_1 = require("gulp-util");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path = require("path");
const MODULES = [
    '../gulp-dependencies',
    '../api',
    '../backend',
    '../frontend',
    '../gateway'
];
gulp_1.task('compile', () => {
    MODULES.forEach(function (moduledir) {
        let pkg_json = path.join(moduledir, 'package.json');
        if (!fs_1.existsSync(pkg_json)) {
            gulp_util_1.log(`[INFO] Skipping module ${moduledir} no package.json present`);
            return;
        }
        let pkg = JSON.parse(fs_1.readFileSync(pkg_json, 'utf-8'));
        if (!pkg.scripts || !pkg.scripts.compile) {
            gulp_util_1.log(`[INFO] Skipping module ${moduledir} no scripts.compile present`);
            return;
        }
        gulp_util_1.log(`[INFO] Compiling module ${moduledir}`);
        try {
            child_process_1.execSync('npm run compile', { cwd: moduledir });
        }
        catch (err) {
            gulp_util_1.log(`[FAILED] Compiling module ${moduledir}. Reason ${err}`);
        }
    });
});
gulp_1.task('clean', () => {
});
