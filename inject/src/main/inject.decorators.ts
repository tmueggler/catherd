import {Context, DefaultContext} from "./context";
import {DefaultFactory} from "./factory";

export namespace Inject {
    let factoryfunctions: Function[] = [];

    // Decorator
    export function Bean(type: {new(): any}) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            let f = target[propertyKey];
            setReturnType(f, type);
            factoryfunctions.push(f);
        };
    }

    export function newContext(): Context {
        let factories = new DefaultFactory();
        factoryfunctions.forEach((f) => {
            let returntype = getReturnType(f);
            if (!returntype) {
                throw new Error(`Missing inject returntype metadata`);
            }
            factories.register(returntype, () => {
                return f();
            });
        });
        return new DefaultContext((type: {new(): any}, ctx: Context) => {
            return factories.create(type, ctx)
        });
    }

    function setReturnType(target: any, type: {new(): any}) {
        if (!target.__inject) {
            target.__inject = {};
        }
        return target.__inject.returntype = type;
    }

    function getReturnType(target: any): {new(): any} {
        if (!target.__inject) {
            throw Error(`Missing inject metadata`);
        }
        return target.__inject.returntype;
    }
}