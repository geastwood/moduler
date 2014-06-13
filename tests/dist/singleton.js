describe('singleton', function() {
    var foo = {}, rst, rst1;
    beforeEach(function() {
        Modulerjs.create(foo);
        foo.define('singleton', function() {
            var instance;
            function init() {
                return Math.random();
            }
            return {
                getInstance: function() {
                    if (!instance) {
                        instance = init();
                    }
                    return instance;
                }
            };
        });
        foo.require(['singleton'], function(s) {
            rst = s.getInstance();
        });
        foo.require(['singleton'], function(s) {
            rst1 = s.getInstance();
        });
    });

    it('should work', function() {
        expect(rst).toBe(rst1);
    });
});
