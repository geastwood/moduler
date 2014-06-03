define(['resolver', 'scriptLoader'], function(resolver, SL) {

    var DependencyManager = function(source, deps) {
        this.source = source;
        this.deps = deps;
        this.count = 0;
        this.data = {
            deps: [],
            names: []
        };
    };

    DependencyManager.prototype.resolve = function() {

        var i, len, dep, resolvedName, aModule, that = this;;

        if (this.deps.length === 0) {
            this.ready();
        }

        for (i = 0, len = this.deps.length; i < len; i++) {

            dep = this.deps[i];
            aModule = resolver.resolve(this.source, resolver.nameService.stripAlias(dep), {action: 'get'});

            /*
            // give warning if the resolved module is empty
            if (typeof aModule === 'undefined') {
                console.warn('module with the name "' + dep + '" is not found.');

                // load module remotely
                new SL('http://localhost:8888/js/modules/module1.js', that.source, function() {
                    that.update();
                });
            }
            */

            this.data.names.push(resolver.nameService.module(dep));
            this.data.deps.push(aModule);
            this.update();

        }

    };

    DependencyManager.prototype.ready = function(fn) {
        var that = this;
        return function() {
            fn(that.data);
        };
    };

    DependencyManager.prototype.update = function() {
        this.count = this.count + 1;
        if (this.count === this.deps.length) {
            this.ready();
        }
    };

    return DependencyManager;
});
