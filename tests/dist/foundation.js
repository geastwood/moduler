describe('foundation when defining', function() {
    var foo = {};
    beforeEach(function() {
        Modulerjs.extend('Checkbox', function() {
            var Control = function() {};
            Control.prototype.type = 'input';
            Control.prototype.getType = function() {
                return this.type;
            };
            var Checkbox = function() {};
            this.util.inherit(Checkbox, Control);
            Checkbox.prototype.type = 'checkbox';
            return Checkbox;
        });
        Modulerjs.create(foo);
    });
    it('should work', function() {
        foo.require(['Checkbox'], function(Checkbox) {
            var c = new Checkbox();
            expect(c.getType()).toBe('checkbox');
        });
    });
});
