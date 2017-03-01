import {DefaultBeanFactory} from "../main/factory";
import {DefaultContext} from "../main/context";
import createSpy = jasmine.createSpy;

const SERVICE_BEAN_NAME = 'service';

class ServiceBean {
}

describe("", () => {
    let ctx: DefaultContext;


    beforeEach(() => {
        createSpy('ctx');
    });

    it("", () => {
        let sut = new DefaultBeanFactory();
        sut.define({
            name: SERVICE_BEAN_NAME,
            create: () => {
                return new ServiceBean()
            }
        });
        let instace = sut.create(SERVICE_BEAN_NAME, ctx);
        expect(instace).not.toBeNull();
    });
});
