import {Transform} from "stream";
import * as through2 from "through2";
import * as fs from "fs-extra";
import * as path from "path";
import {log, PluginError} from "gulp-util";
import {runNpmScript as runScript, readPackageJson} from "./npm.utils";

export function syncDependency(dst_root: string): Transform {
    let id = 'gulp-dependency-sync';

    function transform(file, encoding, done) {
        if (!file.isDirectory()) {
            throw new PluginError(id, `Dependency '${file.path}' not a directory`);
        }
        let module_dir = file.path;
        let pkg = readPackageJson(module_dir);
        if (!pkg) {
            throw new PluginError(id, `Dependency '${module_dir}' not a module, missing package.json`);
        }
        let module_name = pkg.name;
        log(`[INFO] Found module '${module_name}' in '${module_dir}'`);
        let src_dir = path.join(module_dir, 'dist');
        if (!fs.existsSync(src_dir)) {
            throw new PluginError(id, `Dependency '${module_dir}' missing directory ${src_dir}`);
        }
        let dst_dir = path.join(dst_root, module_name);
        log(`[INFO] Installing module ${module_name} from ${src_dir} to ${dst_dir}`);
        fs.emptyDirSync(dst_dir);
        fs.copySync(src_dir, dst_dir);
    }

    return through2.obj(transform);
}

export function runNpmScript(script: string): Transform {
    function transform(file, encoding, done) {
        let dir = file.path;
        if (runScript(dir, script)) {
            log(`[INFO] Success 'npm run ${script}' ('${dir}')`);
        } else {
            log(`[INFO] Skipping '${dir}'. (Missing config for 'npm run ${script})'`);
        }
        done();
    }

    return through2.obj(transform);
}