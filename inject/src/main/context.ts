import {BeanName, BeanFactory} from "./factory";

export interface Context {
    get<T>(name: BeanName): T;
}

export class DefaultContext implements Context {
    private readonly instances: Map<string, any> = new Map();

    constructor(private readonly factory: BeanFactory, private readonly processors?: BeanPostProcessor[]) {
        // instantiate non lazy beans
        factory.forEachDefinition((def) => {
            if (def.lazy) { // property defined and true
                return;
            }
            this.get(def.name);
        });
    }

    get<T>(name: BeanName): T {
        let instance = this.instances.get(name)
        if (!instance) {
            instance = this.factory.create(name, this);
            this.postProcess(name, instance);
            this.instances.set(name, instance);
        }
        return instance;
    }

    private postProcess(name: BeanName, instance: any) {
        if (!this.processors) {
            return;
        }
        this.processors.forEach((processor) => {
            processor.process(name, instance);
        });
    }
}

export interface BeanPostProcessor {
    process(name: BeanName, instance: any): void;
}
