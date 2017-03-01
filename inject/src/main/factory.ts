import {Context} from "./context";

export interface BeanDefinition<T> {
    name: BeanName;
    create: CreateBean<T>;
}

export type BeanName = string;

export interface CreateBean<T> {
    (name: BeanName, ctx: Context): T;
}

export interface BeanFactory {
    create<T>(name: BeanName, ctx: Context): T;
}

export class DefaultBeanFactory implements BeanFactory {
    private definitions: {[name: string]: BeanDefinition<any>} = {};

    define(definition: BeanDefinition<any>) {
        this.definitions[definition.name] = definition;
    }

    create<T>(name: BeanName, ctx: Context): T {
        let def = this.definitions[name];
        if (!def) {
            throw new Error(`No bean definition found for name ${name}`);
        }
        return def.create(name, ctx);
    }
}