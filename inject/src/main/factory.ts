import {Context} from "./context";

export interface Factory {
    <T>(type: {new(): T}, ctx: Context): T;
}

export class DefaultFactory {
    private factories: {[k: string]: Factory} = {};

    register<T>(type: {new(): T}, factory: Factory) {
        this.factories[type.name] = factory;
    }

    create<T>(type: {new(): T}, ctx: Context): T {
        let factory = this.factories[type.name];
        return factory ? factory(type, ctx) : new type();
    }
}