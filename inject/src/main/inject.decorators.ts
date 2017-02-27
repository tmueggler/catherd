import {Context, DefaultContext} from "./context";
import {DefaultFactory, Type} from "./factory";

export namespace Inject {
    let factoryfunctions: Function[] = [];

    // Decorator
    export function Bean<T>(type: Type<T>) {
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
                throw new Error(`Missing inject return type metadata`);
            }
            factories.register(returntype, () => {
                return f();
            });
        });
        return new DefaultContext((type: Type<any>, ctx: Context) => {
            return factories.create(type, ctx)
        });
    }

    function setReturnType(target: any, type: Type<any>) {
        if (!target.__inject) {
            target.__inject = {};
        }
        return target.__inject.returntype = type;
    }

    function getReturnType(target: any): Type<any> {
        if (!target.__inject) {
            throw Error(`Missing inject metadata`);
        }
        return target.__inject.returntype;
    }
}