import * as path from "path";
import * as fs from "fs";
import {execSync} from "child_process";

export function runNpmScript(dir: PathType, script: string): boolean {
    let package_json = readPackageJson(dir);
    if (!package_json) {
        return false;
    } else if (!package_json.scripts) {
        return false;
    } else if (!package_json.scripts[script]) {
        return false;
    }
    execSync(`npm run ${script}`, {cwd: dir});
    return true;
}

const PACKAGE_JSON = 'package.json';

function readPackageJson(dir: PathType): PackageJson {
    let package_json = path.join(dir, PACKAGE_JSON);
    if (!fs.existsSync(package_json)) {
        return null;
    }
    return JSON.parse(fs.readFileSync(package_json, 'utf-8'));
}

type PathType = string;

interface PackageJson {
    name: string,
    version: string,
    scripts?: {[key: string]: string};
}