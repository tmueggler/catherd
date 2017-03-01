import {Context} from "./context";

export interface BeanDefinition<T> {
    name: BeanName;
    create: CreateBean<T>;
    lazy?: boolean; // default false
}

export type BeanName = string;

export interface CreateBean<T> {
    (name: BeanName, ctx: Context): T;
}

export interface BeanFactory {
    forEachDefinition(callback: (value: BeanDefinition<any>) => void): void;
    create<T>(name: BeanName, ctx: Context): T;
}

export class DefaultBeanFactory implements BeanFactory {
    private registry: Map<BeanName, BeanDefinition<any>> = new Map();

    forEachDefinition(callback: (value: BeanDefinition<any>) => void): void {
        this.registry.forEach(callback);
    }

    define(definition: BeanDefinition<any>) {
        this.registry.set(definition.name, definition);
    }

    create<T>(name: BeanName, ctx: Context): T {
        let def = this.registry.get(name);
        if (!def) {
            throw new Error(`No bean definition found for name ${name}`);
        }
        return def.create(name, ctx);
    }
}