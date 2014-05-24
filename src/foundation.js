define(['resolver'], function(resolver) {

    var exports = function(target, name, obj) {
        return resolver.resolve(target, name, {action: 'set', obj: obj});
    };

    var foundation = {
        modules: {},
        register: function(name, fn, deps) {
            // resolve deps
            // export to this.modules.name = fn.apply(null, [deps]);
            exports(this.modules, name, fn.call(null, this.modules));
        }
    };

    return foundation;
});
