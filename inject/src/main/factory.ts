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