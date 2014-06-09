var fb = {};
xdescribe('script loader', function() {
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
xdescribe('script loader mixed', function() {
    var req;
    beforeEach(function(done) {
        Modulerjs.create(fb);
        fb.define('module3', function() {
            return {
                name: 'module3'
            };
        });
        fb.define('bar1', function(greeter, m3) {

            return {
                say: function(msg) {
                    return greeter(msg) + m3.name + '!';
                }
            };

        }, ['greet', 'module3']);
    });
    it('should work with mixed modules', function() {
        var req = fb.require(['bar1'], function(b) {
            expect(b.say('this is ')).toBe('this is module3!');
        });
    });
});
xdescribe('script loader - require', function() {
    var req, f, msg;
    beforeEach(function(done) {
        Modulerjs.create(fb);
        var req = fb.require(['greet', 'module2'], {}, function(greeter, m2) {
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
        expect(msg).toBe('foomodule2');
        expect(f.say('bar module and ')).toBe('bar module and module2!');
    });
});
