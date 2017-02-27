import {Context} from "./context";

export interface Type<T> {
    name: string;
}

export interface Factory {
    <T>(type: Type<T>, ctx: Context): T;
}

export class DefaultFactory {
    private factories: {[k: string]: Factory} = {};

    register<T>(type: Type<T>, factory: Factory): void {
        this.factories[type.name] = factory;
    }

    create<T>(type: Type<T>, ctx: Context): T {
        let factory = this.factories[type.name];
        if (!factory) {
            throw new Error(`No factory for type '${type.name}' registered`);
        }
        return factory(type, ctx);
    }
}