import "reflect-metadata";
import {BeanPostProcessor, BeanName, Context, ContextLifecycle} from "@catherd/inject/node";
import {EventBus} from "../eventbus/eventbus.service";
import {AppEvent} from "./app.event";
import {AppBeans} from "./app.beans";
import {LoggerFactory} from "@catherd/logcat/node";

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
    private readonly log = LoggerFactory.get(LOGGER_NAME);

    constructor(public readonly phase: number, private readonly target: any, private readonly method: string) {
    }

    run(): void {
        this.target[this.method]();
    }

    runSafe(): void {
        try {
            this.run();
        } catch (e) {
            this.log.warn(`Uncaught exception running ${this}. Reason ${e}`);
        }
    }

    toString() {
        return `Run{${this.target}.${this.method}(), phase=${this.phase}}`;
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

const LOGGER_NAME = 'applifecycle-beanpostprocessor';

export class AppLifecycleBeanPostProcessor implements BeanPostProcessor {
    private readonly log = LoggerFactory.get(LOGGER_NAME);
    private isInitialized: boolean = false;
    private isDestroyed: boolean = false;
    private pendingStart: Run[] = [];
    private pendingStop: Run[] = [];

    process(name: BeanName, instance: any): any {
        if (this.isDestroyed) {
            return null;
        }
        let start: StartMetadata = Reflect.getMetadata(LifecycleMetadata.START, instance.constructor.prototype);
        if (start) {
            if (this.isInitialized) {
                new Run(start.phase, instance, start.run).runSafe();
            } else {
                this.pendingStart.push(new Run(start.phase, instance, start.run)); // run once initialized
            }
        }
        let stop: StopMetadata = Reflect.getMetadata(LifecycleMetadata.STOP, instance.constructor.prototype);
        if (stop) {
            this.pendingStop.push(new Run(stop.phase, instance, stop.run));
        }
    }

    @ContextLifecycle.Initialized()
    contextInitialized(ctx: Context): void {
        if (!this.pendingStart) {
            return;
        }
        this.pendingStart.sort(Run.compareForStart);
        this.pendingStart.forEach((start) => start.runSafe());
        this.pendingStart = null;
        this.isInitialized = true;
        ctx.get<EventBus>(AppBeans.EVENT_BUS).send({type: AppEvent.START, src_id: null});
    }

    @ContextLifecycle.Destroyed()
    contextDestroyed(ctx: Context): void {
        if (!this.pendingStop) {
            return;
        }
        this.pendingStop.sort(Run.compareForStop);
        this.pendingStop.forEach((stop) => stop.runSafe());
        this.pendingStop = null;
        this.isDestroyed = true;
        ctx.get<EventBus>(AppBeans.EVENT_BUS).send({type: AppEvent.STOP, src_id: null});
    }
}