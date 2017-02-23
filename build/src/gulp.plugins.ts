import {Transform} from "stream";
import * as through2 from "through2";
import {src, dest} from "gulp";
import * as fs from "fs";
import * as path from "path";
import * as del from "del";
import {log, PluginError} from "gulp-util";
import {runNpmScript as runScript, PathType} from "./npm.utils";

export function syncDependency(dstdir: string): Transform {
    function transform(file, encoding, done) {
        if (!fs.statSync(file.path).isDirectory()) throw new PluginError('gulp-dependency-sync', 'Module must be directory');
        // Cleanup destination module dir
        let toclean = path.join(file.path, '/**/*');
        src(toclean)
            .pipe(cleanup(dstdir))
            .on('finish', function () { // 'end isn't called'
                // Copy source module to destination
                let copyfrom = path.join(file.path, '**/*');
                log(`Copy module from ${copyfrom}`);
                src(copyfrom)
                    .pipe(dest(dstdir))
                    .on('end', function () {
                        done();
                    });
            });
    }

    return through2.obj(transform);
}

function cleanup(root: PathType): Transform {
    function transform(file, encoding, done) {
        let remove = path.join(root, file.relative);
        if (!file.isDirectory()) {
            log(`Removing ${remove}`);
            del.sync(remove);
        }
        done();
    }

    return through2.obj(transform);
}

export function runNpmScript(script: string): Transform {
    function transform(file, encoding, done) {
        let dir = file.path;
        if (runScript(dir, script)) {
            log(`[INFO] Success 'npm rum ${script}' ('${dir}')`);
        } else {
            log(`[INFO] Skipping '${dir}'. (Missing config for 'npm run ${script})'`);
        }
        done();
    }

    return through2.obj(transform);
}