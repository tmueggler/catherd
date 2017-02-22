import {task} from "gulp";
import {log} from "gulp-util";
import {execSync} from "child_process";
import {readFileSync, existsSync} from "fs";
import * as path from "path";

const MODULES = [
    '../gulp-dependencies',
    '../api',
    '../backend',
    '../frontend',
    '../gateway'
];

task('compile', () => {
    MODULES.forEach(function (moduledir) {
        let pkg_json = path.join(moduledir, 'package.json');
        if (!existsSync(pkg_json)) {
            log(`[INFO] Skipping module ${moduledir} no package.json present`);
            return;
        }
        let pkg = JSON.parse(readFileSync(pkg_json, 'utf-8'));
        if (!pkg.scripts || !pkg.scripts.compile) {
            log(`[INFO] Skipping module ${moduledir} no scripts.compile present`);
            return;
        }
        log(`[INFO] Compiling module ${moduledir}`);
        try {
            execSync('npm run compile', {cwd: moduledir});
        } catch (err) {
            log(`[FAILED] Compiling module ${moduledir}. Reason ${err}`);
        }
    });
});

task('clean', () => {
});