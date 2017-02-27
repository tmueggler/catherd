import {DefaultFactory} from "../main/factory";
import {DefaultContext} from "../main/context";
import createSpy = jasmine.createSpy;

class ServiceBean {
}

describe("", () => {
    let ctx: DefaultContext;


    beforeEach(() => {
        createSpy('ctx');
    });

    it("", () => {
        let sut = new DefaultFactory();
        sut.register(ServiceBean, () => {
            return new ServiceBean();
        });
        let instace = sut.create(ServiceBean, ctx);
        expect(instace).not.toBeNull();
    });
});
