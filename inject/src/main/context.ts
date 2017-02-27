import {Factory} from "./factory";

export interface Context {
    get<T>(type: {new(): T}): T;
}

export class DefaultContext implements Context {
    private readonly instances: {[k: string]: any} = {};

    constructor(private readonly factory: Factory) {
    }

    get<T>(type: {new(): T}): T {
        let instance = this.instances[type.name];
        if (!instance) {
            let instance = this.factory(type, this);
            this.instances[type.name] = instance;
        }
        return instance;
    }
}