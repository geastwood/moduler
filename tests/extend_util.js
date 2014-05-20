describe('extend util', function() {
    var foo = {}, bar = {}, depFoo, depBar;
    beforeEach(function() {
        moduler.create(foo);
        moduler.create(bar);
        depFoo = foo.require(['util']);
        depBar = bar.require(['util']);
    });
    it('should have util as dependency', function() {
        expect(depFoo.util).toBeDefined();
    });
    it('should have correct api', function() {
        expect(depFoo.util.pluck).toBeDefined();
    });

    describe('pluck', function() {

        var obj1 = {name: 'foo', title: 'Foo'};
        var obj2 = {name: 'bar', title: 'Bar'};

        it('should work', function() {
            var getName = depFoo.util.pluck('name');
            var getTitle = depBar.util.pluck('title');
            var getNothing = depBar.util.pluck('nothing');
            expect(getName(obj1)).toBe('foo');
            expect(getTitle(obj2)).toBe('Bar');
            expect(getNothing(obj2)).toBeUndefined();
            expect(getNothing(obj1)).toBeUndefined();
        });
    });
});
