import {Context, BeanPostProcessor} from "./context";
import {BeanFactory, BeanName} from "./factory";
import {ContextLifecycleBeanPostProcessor} from "./context.lifecycle.beanpostprocessor";

export class DefaultContext implements Context {
    private readonly instances: Map<string, any>;
    private processorLifecycle: ContextLifecycleBeanPostProcessor;

    private constructor(private readonly factory: BeanFactory, private readonly processors?: BeanPostProcessor[]) {
        this.instances = new Map();
        this.processorLifecycle = new ContextLifecycleBeanPostProcessor();
        if (processors) {
            processors.forEach((processor) => this.processorLifecycle.process(null, processor));
        }
    }

    static initialize(factory: BeanFactory, processors?: BeanPostProcessor[]): Context {
        let ctx = new DefaultContext(factory, processors);
        // make context available for injection
        ctx.instances.set(Context.Bean.NAME, ctx);
        // instantiate non lazy beans
        ctx.factory.forEachDefinition((def) => {
            if (def.lazy) { // property defined and true
                return;
            }
            ctx.get(def.name);
        });
        ctx.initialized();
        return ctx;
    }

    private initialized() {
        this.processorLifecycle.initialize(this);
    }

    get<T>(name: BeanName): T {
        let instance = this.instances.get(name)
        if (!instance) {
            instance = this.factory.create(name, this);
            instance = this.process(name, instance);
            this.instances.set(name, instance);
        }
        return instance;
    }

    private process(name: BeanName, instance: any): any {
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
        this.processorLifecycle.destroy(this);
    }
}