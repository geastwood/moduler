define(['resolver'], function(resolver) {

    var foundation = {
        modules: {},
        register: function(name, fn, base) {
            resolver.exports(this.modules, name, fn.call(base, this.modules));
        }
    };

    return foundation;

});
