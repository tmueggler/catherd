import {Inject} from "../main/inject.decorators";

describe("Using a bean decorator", () => {
    class Service {
    }

    class Factories {
        @Inject.Bean(Service)
        static service() {
            return new Service();
        }
    }

    it("the context should return a service instance", () => {
        let ctx = Inject.newContext();
        let instance = ctx.get(Service);
        expect(instance).not.toBeNull();
    });

    it("the factory method should have been called", () => {
        spyOn(Factories, 'service');
        let ctx = Inject.newContext();
        let instance = ctx.get(Service);
        expect(Factories.service).toHaveBeenCalled();
        expect(instance).not.toBeNull();
    });
});