import {DefaultContext} from "../main/context";
import {BeanFactory, DefaultBeanFactory} from "../main/factory";

const BEAN_NAME = 'bean';

class Bean {
}

describe("Using a default context", () => {
    let factory: BeanFactory;

    beforeEach(() => {
        factory = new DefaultBeanFactory();
    });

    it("should call its factory create method to create bean instances", () => {
        spyOn(factory, 'create').and.returnValue(new Bean());
        let ctx = new DefaultContext(factory);
        let instance = ctx.get(BEAN_NAME);
        expect(instance).toBeDefined();
        expect(instance).not.toBeNull();
    });
});