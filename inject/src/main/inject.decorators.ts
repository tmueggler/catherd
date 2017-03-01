import {Context, DefaultContext} from "./context";
import {DefaultBeanFactory, BeanName, BeanDefinition} from "./factory";

export namespace Inject {
    let definitions: BeanDefinition<any>[] = [];

    // Decorator
    export function Bean<T>(name: BeanName) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            definitions.push({
                name: name,
                create: target[propertyKey]
            })
        };
    }

    export function newContext(): Context {
        let factory = new DefaultBeanFactory();
        definitions.forEach((def) => {
            factory.define(def);
        });
        return DefaultContext.initialize(factory);
    }
}