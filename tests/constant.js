describe('constant of a module', function() {
    var foo;
    beforeEach(function() {
        foo = {};
        moduler.create(foo);
    });

    it('api', function() {
        foo.define('foo', function() {
            expect(this.constant.set).toBeDefined();
            expect(this.constant.get).toBeDefined();
            return {};
        });
    });
    it('constant can only be defined once', function() {
        foo.define('bar', function() {
            expect(this.constant.set('foo', 'foo is a constant')).toBe(true);
            expect(this.constant.set('foo', 'should not be able to set')).toBe(false);
            return {};
        });
    });
});
describe('more on constant', function() {
    var foo = {};
    var asyncRst1, asyncRst2;
    beforeEach(function(done) {
        moduler.create(foo);
        foo.constant.set('c1', 'constant1');
        foo.constant.set('c2', 'constant2');
        foo.require(['Person'], function(Person) {
            var p = new Person();
            asyncRst1 = this.constant.get('c1');
            asyncRst2 = this.constant.get('c2');
            done();
        });
    });
    it('at define', function() {
        foo.define('bar', function() {
            expect(this.constant.get('c1')).toBe('constant1');
            expect(this.constant.get('c2')).toBe('constant2');
        });
    });
    it('at require', function() {
        expect(asyncRst1).toBe('constant1');
        expect(asyncRst2).toBe('constant2');
    });
});
describe('different modules share utils but not constant', function() {
    var foo = {}, bar = {};
    var asyncRst1, asyncRst2;
    beforeEach(function(done) {
        moduler.create(foo);
        moduler.create(bar);
        foo.constant.set('c1', 'constant1 in foo');
        foo.constant.set('c2', 'constant2 in foo');
        bar.constant.set('c1', 'constant1 in bar');
        bar.constant.set('c2', 'constant2 in bar');
        foo.require(['Person'], function(Person) {
            var p = new Person();
            asyncRst1 = this.constant.get('c1');
            asyncRst2 = this.constant.get('c2');
            done();
        });
    });
    it('share utils', function() {
        foo.define('bar', function() {
            expect(this.constant.get('c1')).toBe('constant1 in foo');
            expect(this.constant.get('c2')).toBe('constant2 in foo');
        });
        bar.define('bar', function() {
            expect(this.constant.get('c1')).toBe('constant1 in bar');
            expect(this.constant.get('c2')).toBe('constant2 in bar');
        });
    });
});
