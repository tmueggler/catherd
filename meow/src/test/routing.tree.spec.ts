import {RoutingTree} from "../main/routing.tree";

describe('When adding a value under topic a/b/c', () => {
    let spy: (val: any) => void;
    let val: any;
    let sut: RoutingTree<any>;

    beforeEach(() => {
        spy = jasmine.createSpy('visit');
        val = {};
        sut = new RoutingTree<any>();
        sut.add('a/b/c', val);
    });

    it('should be returned for topic a/b/c', () => {
        sut.forEach('a/b/c', spy);
        expect(spy).toHaveBeenCalledWith(val);
    });

    it('should not be returned for topic a', () => {
        sut.forEach('a', spy);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should not be returned for topic a/b', () => {
        sut.forEach('a/b', spy);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should not be returned for topic a/b/c/d', () => {
        sut.forEach('a/b/c/d', spy);
        expect(spy).not.toHaveBeenCalled();
    });
});

describe("When adding a value with wildcard '+'", () => {
    let spy: (val: any) => {};
    let val;
    let sut: RoutingTree<any>;

    beforeEach(() => {
        spy = jasmine.createSpy('visit');
        val = {};
        sut = new RoutingTree();
        sut.add('a/+/c', val);
    });

    it('should be returned independent of wildcard topic part', () => {
        sut.forEach('a/_whatever_/c', spy);
        expect(spy).toHaveBeenCalledWith(val);
    });

    it('should not be returned if specific topic parts do not match', () => {
        sut.forEach('a/_whatever_/d', spy);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should not be returned if topic is shorter', () => {
        sut.forEach('a/b', spy);
        expect(spy).not.toHaveBeenCalled();
    });
});

describe("When adding a value with wildcard '#", () => {
    let spy: (val: any) => void;
    let val: any;
    let sut: RoutingTree<any>;

    beforeEach(() => {
        spy = jasmine.createSpy('visit');
        val = {};
        sut = new RoutingTree();
        sut.add('a/#', val);
    });

    it('should be returned for any sub path', () => {
        sut.forEach('a/b', spy);
        expect(spy).toHaveBeenCalledWith(val);
    });

    it('should be returned for any sub path', () => {
        sut.forEach('a/b/c', spy);
        expect(spy).toHaveBeenCalledWith(val);
    });

    it('should be returned for any sub path', () => {
        sut.forEach('a/b/c/d', spy);
        expect(spy).toHaveBeenCalledWith(val);
    });
});

describe('When adding multiple values', () => {
    it('all values should be returned', () => {
        let spy = jasmine.createSpy('visit');
        let topic = 'a/b/c';
        let values = [{}, {}];

        let sut = new RoutingTree();
        sut.add(topic, values[0]);
        sut.add(topic, values[1]);
        sut.forEach(topic, spy);

        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenCalledWith(values[0]);
        expect(spy).toHaveBeenCalledWith(values[1]);
    });

    it("all values added with wildcard '#'", () => {
        let spy = jasmine.createSpy('visit');
        let values = [{}, {}, {}];

        let sut = new RoutingTree();
        sut.add('#', values[0]);
        sut.add('a/#', values[1]);
        sut.add('a/b/#', values[2]);
        sut.forEach('a/b/c', spy);

        expect(spy).toHaveBeenCalledTimes(3);
        expect(spy).toHaveBeenCalledWith(values[0]);
        expect(spy).toHaveBeenCalledWith(values[1]);
        expect(spy).toHaveBeenCalledWith(values[2]);
    });
});

describe('When adding for absolute topic', () => {
    it('', () => {
        let spy = jasmine.createSpy('visit');
        let val = {};
        let sut = new RoutingTree();
        sut.add('/a/+/b/#', val);

        sut.forEach('/a/_any_/b', spy);

        expect(spy).toHaveBeenCalledWith(val);
    });

    it('', () => {
        let spy = jasmine.createSpy('visit');
        let val = {};
        let sut = new RoutingTree();
        sut.add('/a/+/#', val);

        sut.forEach('/a/_any_/_thing_', spy);

        expect(spy).toHaveBeenCalledWith(val);
    });
});