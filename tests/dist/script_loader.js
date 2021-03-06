var fb = {};
describe('script loader', function() {
    var req, rst;
    beforeEach(function(done) {
        Modulerjs.create(fb);
        fb.require(['greet'], function(bar) {
            rst = bar;
            done();
        });
    });
    it('should work', function() {
        expect(rst('some msg')).toBe('some msg.');
    });
});
describe('script loader - require', function() {
    var f, msg;
    beforeEach(function(done) {
        Modulerjs.create(fb);
        fb.require(['greet', 'module2'], function(greeter, m2) {
            f = {
                name: 'bar',
                say: function(msg) {
                    return greeter(msg) + m2.name +  '!';
                }
            };
            msg = greeter('foo' + m2.name);
            done();
        });
    });
    it('should work', function() {
        expect(msg).toContain('foomodule2');
        expect(f.say('bar module and ')).toContain('bar module and');
    });
});
describe('script loader - define with a remote dep', function() {
    var foo = {}, rst;
    beforeEach(function(done) {
        Modulerjs.create(foo);
        foo.define('greetPlus', function(greet) {
            return function(msg) {
                return greet(msg) + '.';
            };
        }, ['greet']);
        setTimeout(function() {
            foo.require(['greetPlus'], function(greet) {
                rst = greet;
                done();
            });
        }, 1000);
    });
    it('should work', function() {
        expect(rst('works')).toBe('works..');
    });
});
