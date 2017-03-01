import {BeanName, BeanFactory} from "./factory";

export interface Context {
    get<T>(name: BeanName): T;
}

export class DefaultContext implements Context {
    private readonly instances: {[name: string]: any} = {};

    constructor(private readonly factory: BeanFactory) {
    }

    get<T>(name: BeanName): T {
        let instance = this.instances[name];
        if (!instance) {
            instance = this.factory.create(name, this);
            this.instances[name] = instance;
        }
        return instance;
    }
}
