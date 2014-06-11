describe('module with deep namespace', function() {
    var foo = {}, f;
    beforeEach(function(done) {
        Modulerjs.create(foo);
        foo.require(['util.isNumber'], function(isNumber) {
            f = isNumber;
            done();
        });
    });
    it('should work', function() {
        expect(f(2)).toBe(true);
        expect(f(NaN)).toBe(false);
        expect(f(/2/)).toBe(false);
    });
});
describe('module with deep namespace, multiple dependencies', function() {
    var foo = {}, f, maxfn, minfn;
    beforeEach(function(done) {
        Modulerjs.create(foo);
        foo.require(['util.isNumber', 'math.max', 'math.min'], function(isNumber, max, min) {
            f = isNumber;
            maxfn = max;
            minfn = min;
            done();
        });
    });
    it('should work', function() {
        expect(f(2)).toBe(true);
        expect(f(NaN)).toBe(false);
        expect(f(/2/)).toBe(false);
        expect(maxfn(1, 2, 4, 5, 20, null)).toBe(20);
        expect(minfn(1, 2, 4, 5, 20)).toBe(1);
    });
});
describe('module with deep namespace, remote script has dependencies', function() {
    var foo = {}, f;
    beforeEach(function(done) {
        Modulerjs.create(foo);
        foo.require(['math.average'], function(average) {
            f = average;
            done();
        });
    });
    it('should work', function() {
        console.log(foo.debug.getModules());
        expect(f(2)).toBe(2);
        expect(f(1, 2, 3, 4, 5)).toBe(3);
        expect(f(1, 2, 3, 4, 5, 'string', ['array'])).toBe(3);
        expect(f()).toBe(0);
    });
});
