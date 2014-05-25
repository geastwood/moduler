define(['resolver'], function(resolver) {

    var foundation = {
        modules: {},
        register: function(name, fn, deps) {
            // resolve deps
            // export to this.modules.name = fn.apply(null, [deps]);
            resolver.exports(this.modules, name, fn.call(null, this.modules));
        }
    };

    return foundation;

});
