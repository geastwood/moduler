var fb = {};
describe('script loader', function() {
    var req;
    beforeEach(function() {
        Modulerjs.create(fb);
        fb.define('bar', function(greeter, m2) {
            return {
                name: 'bar',
                say: function(msg) {
                    return greeter(msg) + m2.name +  '!';
                }
            };
        }, ['greet', 'module2']);
    });
    it('should work', function() {
        var req = fb.require(['greet'], {}, function(bar) {
            expect(true).toBe(false);
            expect(bar('some msg')).toBe('some msg');
        });
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
