var fb = {};
xdescribe('script loader', function() {
    beforeEach(function(done) {
        moduler.create(fb);
        fb.define('bar', function(greeter, m2) {
            return {
                name: 'bar',
                say: function(msg) {
                    return greeter(msg) + m2.name +  '!';
                }
            };
        }, ['greet', 'module2']);
        setTimeout(function() {
            done();
        }, 1000);
    });
    it('should work', function() {
        var msg = fb.require(['bar']);
        expect(msg.bar.say('this is ')).toBe('this is module2!');
    });
});
xdescribe('script loader mixed', function() {

    beforeEach(function(done) {
        moduler.create(fb);
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
        setTimeout(function() {
            done();
        }, 1000);
    });
    it('should work with mixed modules', function() {
        var msg = fb.require(['bar1']);
        expect(msg.bar1.say('this is ')).toBe('this is module3!');
    });
});
