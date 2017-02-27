export namespace Inject {
    let factoryfunctions: Function[] = [];

    export function Bean(type: {new(): any}) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            factoryfunctions.push(target[propertyKey]);
        };
    }
}