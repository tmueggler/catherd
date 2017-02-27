import {DefaultContext} from "../main/context";

describe("", () => {
    it("", () => {
        let factory = jasmine.createSpy('factories').and.returnValue({});
        let ctx = new DefaultContext(factory);
        let instance = ctx.get({name: 'any'});
        expect(instance).toBeDefined();
        expect(instance).not.toBeNull();
    });
});