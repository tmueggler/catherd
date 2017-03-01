import {Inject} from "../main/inject.decorators";

describe("Using a bean decorator", () => {
    const SERVICE_BEAN_NAME = 'service';

    class Service {
    }

    class Factories {
        @Inject.Bean(SERVICE_BEAN_NAME)
        static service() {
            return new Service();
        }
    }

    it("the context should return a service instance", () => {
        let ctx = Inject.newContext();
        let instance = ctx.get(SERVICE_BEAN_NAME);
        expect(instance).toBeDefined();
        expect(instance).not.toBeNull();
    });

    it("the factory method should have been called", () => {
        spyOn(Factories, 'service');
        let ctx = Inject.newContext();
        let instance = ctx.get(SERVICE_BEAN_NAME);
        expect(Factories.service).toHaveBeenCalled();
        expect(instance).toBeDefined();
        expect(instance).not.toBeNull();
    });
});