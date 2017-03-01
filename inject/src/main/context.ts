import {BeanName, BeanFactory} from "./factory";

export namespace Context {
    export const CONTEXT_BEANNAME = '$$context';

    // Decorator
    export function Initialized() {
        return function (target: any, property: string, descriptor: PropertyDescriptor) {
            target._$context_initialized$_ = target[property];
        }
    }

    // Decorator
    export function Destroyed() {
        return function (target: any, property: string, descriptor: PropertyDescriptor) {
            target._$context_destroyed$_ = target[property];
        }
    }
}

export interface Context {
    get<T>(name: BeanName): T;
    destroy(): void;
}

export class DefaultContext implements Context {
    private readonly instances: Map<string, any>;

    private constructor(private readonly factory: BeanFactory, private readonly processors?: BeanPostProcessor[]) {
        this.instances = new Map();
    }

    static initialize(factory: BeanFactory, processors?: BeanPostProcessor[]): Context {
        let ctx = new DefaultContext(factory, processors);
        // make context available for injection
        ctx.instances.set(Context.CONTEXT_BEANNAME, ctx);
        // instantiate non lazy beans
        ctx.factory.forEachDefinition((def) => {
            if (def.lazy) { // property defined and true
                return;
            }
            ctx.get(def.name);
        });
        ctx.informInitialized();
        return ctx;
    }

    private informInitialized() {
        if (!this.processors) {
            return;
        }
        this.processors.forEach((processor) => {
            try {
                (processor as any)._$context_initialized$_(this);
            } catch (e) {
                // ignore
            }
        });
    }

    get<T>(name: BeanName): T {
        let instance = this.instances.get(name)
        if (!instance) {
            instance = this.factory.create(name, this);
            instance = this.postProcess(name, instance);
            this.instances.set(name, instance);
        }
        return instance;
    }

    private postProcess(name: BeanName, instance: any): any {
        if (!this.processors) {
            return instance;
        }
        this.processors.forEach((processor) => {
            let processed = processor.process(name, instance);
            if (processed) {
                instance = processed
            }
        });
        return instance;
    }

    destroy(): void {
        this.informDestroyed();
    }

    private informDestroyed(): void {
        if (!this.processors) {
            return;
        }
        this.processors.forEach((processor) => {
            try {
                (<any>processor)._$context_destroyed$_(this);
            } catch (e) {
                // ignore
            }
        });
    }
}

export interface BeanPostProcessor {
    process(name: BeanName, instance: any): any;
}
