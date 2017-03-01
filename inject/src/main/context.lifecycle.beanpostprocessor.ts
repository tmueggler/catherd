import "reflect-metadata";
import {BeanPostProcessor, Context} from "./context";
import {BeanName} from "./factory";

namespace Metadata {
    const NAMESPACE = 'context:lifecycle';

    export const INITIALIZED = `${NAMESPACE}:initialized`;

    export interface Initialized {
        run: string
    }

    export const DESTROYED = `${NAMESPACE}:destroyed`;

    export interface Destroyed {
        run: string;
    }
}

export namespace ContextLifecycle {
    // Decorator
    export function Initialized() {
        return function (target: any, property: string, descriptor: PropertyDescriptor) {
            Reflect.defineMetadata(Metadata.INITIALIZED, {run: property}, target);
        }
    }

    // Decorator
    export function Destroyed() {
        return function (target: any, property: string, descriptor: PropertyDescriptor) {
            Reflect.defineMetadata(Metadata.DESTROYED, {run: property}, target);
        }
    }
}

class Run {
    constructor(private readonly target: any, private readonly method: string) {
    }

    run(ctx: Context): void {
        this.target[this.method](ctx);
    }

    runSafe(ctx: Context): void {
        try {
            this.run(ctx);
        } catch (e) {
            console.warn(`Problem uncaught exception running ${this}. Reason ${e}`);
        }
    }

    toString() {
        return `Run{${this.target}.${this.method}()}`;
    }
}

export class ContextLifecycleBeanPostProcessor implements BeanPostProcessor {
    private isInitialized: boolean = false;
    private context: Context;
    private isDestroyed: boolean = false;
    private pendingInitialize: Run[] = [];
    private pendingDestroy: Run[] = [];

    process(name: BeanName, instance: any): any {
        if (this.isDestroyed) {
            return null;
        }
        let initialized: Metadata.Initialized = Reflect.getMetadata(Metadata.INITIALIZED, instance.constructor.prototype);
        if (initialized) {
            if (this.isInitialized) {
                new Run(instance, initialized.run).runSafe(this.context);
            } else {
                this.pendingInitialize.push(new Run(instance, initialized.run));
            }
        }
        let destroyed: Metadata.Destroyed = Reflect.getMetadata(Metadata.DESTROYED, instance.constructor.prototype);
        if (destroyed) {
            this.pendingDestroy.push(new Run(instance, destroyed.run));
        }
    }

    initialize(ctx: Context): void {
        if (!this.pendingInitialize) {
            return;
        }
        this.context = ctx;
        this.pendingInitialize.forEach((initialize) => initialize.runSafe(ctx));
        this.pendingInitialize = null;
        this.isInitialized = true;
    }

    destroy(ctx: Context): void {
        if (!this.pendingDestroy) {
            return;
        }
        this.pendingDestroy.forEach((destroy) => destroy.runSafe(ctx));
        this.pendingDestroy = null;
        this.context = null;
        this.isDestroyed = true;
    }
}