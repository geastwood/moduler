describe('extend util', function() {
    var foo = {};
    var obj1 = {name: 'foo', title: 'Foo'};
    var obj2 = {name: 'bar', title: 'Bar'};
    var getName, getTitle, getNothing;

    beforeEach(function(done) {
        moduler.create(foo);
        foo.require(['util'], function(util) {
            getName = util.pluck('name');
            getTitle = util.pluck('title');
            getNothing = util.pluck('nothing');
            done();
        });
    });

    it('pluck should work', function() {
        expect(getName(obj1)).toBe('foo');
        expect(getTitle(obj2)).toBe('Bar');
        expect(getNothing(obj2)).toBeUndefined();
        expect(getNothing(obj1)).toBeUndefined();
    });

});
