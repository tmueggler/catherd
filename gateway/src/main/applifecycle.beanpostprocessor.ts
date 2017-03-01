import "reflect-metadata";
import {BeanPostProcessor, BeanName, Context} from "@catherd/inject/node";
import {EventBus} from "./eventbus/eventbus.service";
import {AppEvent} from "./app.event";
import {AppBeans} from "./app.beans";

namespace LifecycleMetadata {
    const NAMESPACE = 'applifecycle';
    export const START = `${NAMESPACE}:start`;
    export const STOP = `${NAMESPACE}:stop`;
}

interface StartMetadata {
    run: string,
    phase: number
}

interface StopMetadata {
    run: string,
    phase: number
}

// Decorator
export function Start(phase?: number) {
    return function (target: any, property: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata(LifecycleMetadata.START, {
            run: property,
            phase: phase ? phase : Number.MAX_SAFE_INTEGER
        }, target);
    }
}

// Decorator
export function Stop(phase?: number) {
    return function (target: any, property: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata(LifecycleMetadata.STOP, {
            run: property,
            phase: phase ? phase : Number.MAX_SAFE_INTEGER
        }, target);
    }
}

class Run {
    constructor(public readonly phase: number, private readonly target: any, private readonly method: string) {
    }

    run(): void {
        this.target[this.method]();
    }

    toString() {
        return `Run ${this.target.name}.${this.method}() in phase ${this.phase}`;
    }

    static compareForStart(r1: Run, r2: Run): number {
        if (r1.phase < r2.phase) {
            return -1;
        } else if (r1.phase > r2.phase) {
            return 1;
        } else {
            return 0;
        }

    }

    static compareForStop(r1: Run, r2: Run): number {
        if (r1.phase < r2.phase) {
            return 1;
        } else if (r1.phase > r2.phase) {
            return -1
        } else {
            return 0;
        }
    }
}

export class AppLifecycleBeanPostProcessor implements BeanPostProcessor {
    private initialized: boolean = false;
    private destroyed: boolean = false;
    private pendingstart: Run[] = [];
    private pendingstop: Run[] = [];

    process(name: BeanName, instance: any): any {
        if (this.destroyed) {
            return instance;
        }
        let start: StartMetadata = Reflect.getMetadata(LifecycleMetadata.START, instance.constructor.prototype);
        if (start) {
            if (this.initialized) {
                this.runSafe(new Run(start.phase, instance, start.run))
            } else {
                this.pendingstart.push(new Run(start.phase, instance, start.run)); // run once initialized
            }
        }
        let stop: StopMetadata = Reflect.getMetadata(LifecycleMetadata.STOP, instance.constructor.prototype);
        if (stop) {
            this.pendingstop.push(new Run(stop.phase, instance, stop.run));
        }
    }

    private runSafe(run: Run) {
        try {
            run.run();
        } catch (e) {
            console.warn(`Uncaught exception running ${run}. Reason ${e}`);
        }
    }


    @Context.Initialized()
    contextInitialized(ctx: Context) {
        this.pendingstart.sort(Run.compareForStart);
        this.pendingstart.forEach((start) => {
            this.runSafe(start);
        });
        this.pendingstart = null;
        this.initialized = true;
        ctx.get<EventBus>(AppBeans.EVENT_BUS).send({type: AppEvent.START, src_id: null});
    }

    @Context.Destroyed()
    contextDestroyed(ctx: Context) {
        this.pendingstop.sort(Run.compareForStop);
        this.pendingstop.forEach((stop) => {
            this.runSafe(stop);
        });
        this.pendingstop = null;
        this.destroyed = true;
        ctx.get<EventBus>(AppBeans.EVENT_BUS).send({type: AppEvent.STOP, src_id: null});
    }
}