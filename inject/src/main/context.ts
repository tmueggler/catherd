import {BeanName} from "./factory";

export namespace Context {
    export namespace Bean {
        export const NAME = '$$context';
    }
}

export interface Context {
    get<T>(name: BeanName): T;
    destroy(): void;
}

export interface BeanPostProcessor {
    process(name: BeanName, instance: any): any;
}