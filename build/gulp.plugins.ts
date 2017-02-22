import through2 = require("through2");
import {log} from "gulp-util";
import {runNpmScript as runScript} from "./npm.utils";

export function runNpmScript(script: string) {
    return through2.obj((file, encoding, done) => {
        let dir = file.path;
        if (runScript(dir, script)) {
            log(`[INFO] Success 'npm rum ${script}' ('${dir}')`);
        } else {
            log(`[INFO] Skipping '${dir}'. (Missing config for 'npm run ${script})'`);
        }
        done();
    })
}