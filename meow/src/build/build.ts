import {removeSync} from "fs-extra";

interface Task {
    run(): void;
}

class Clean implements Task {
    private paths: string[];

    constructor(...paths: string[]) {
        this.paths = paths;
    }

    run(): void {
        for (let path of this.paths) {
            try {
                removeSync(path);
                console.info(`Removed ${path}`);
            } catch (e) {
                console.warn(`Problem removing ${path}`);
            }
        }
    }
}

const tasks: Map<string, Task> = new Map();
tasks.set('clean:build', new Clean('build'));
tasks.set('clean:test', new Clean('test'));
tasks.set('clean:dist', new Clean('dist'));
tasks.set('clean:all', new Clean('build', 'test', 'dist'));

let taskid = process.argv[2];
console.info(`Running ${taskid}`);
let task = tasks.get(taskid);
try {
    task.run();
} catch (e) {
    console.error(`Task ${taskid} failed. Reason ${e}`);
}