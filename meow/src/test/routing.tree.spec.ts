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

    it('', () => {
        sut.forEach('a/b', spy);
        expect(spy).toHaveBeenCalledWith(val);
    });

    it('', () => {
        sut.forEach('a/b/c', spy);
        expect(spy).toHaveBeenCalledWith(val);
    });

    it('', () => {
        sut.forEach('a/b/c/d', spy);
        expect(spy).toHaveBeenCalledWith(val);
    });
});