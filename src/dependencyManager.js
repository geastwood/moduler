define(['resolver', 'scriptLoader'], function(resolver, SL) {

    var DependencyManager = function(source, deps) {
        this.source = source;
        this.deps = deps;
        this.count = 0;
        this.data = {};
    };

    var baseUrl = 'http://localhost:8888/js/modules/';

    DependencyManager.prototype.resolve = function() {

        var i, len, dep, resolvedName, aModule, that = this;

        if (this.deps.length === 0) {
            this.ready();
        }

        for (i = 0, len = this.deps.length; i < len; i++) {

            dep = this.deps[i];
            this.data[resolver.nameService.module(dep)] = null;
            aModule = resolver.resolve(this.source, resolver.nameService.stripAlias(dep), {action: 'get'});

            // give warning if the resolved module is empty
            if (typeof aModule === 'undefined') {

                // load module remotely, TODO: refactor duplicate code
                new SL(baseUrl + resolver.nameService.stripAlias(dep) + '.js'/* url */,
                        this.source/* modules */,
                        function(name) { /* callback  */
                            that.register(that.source, name);
                            that.update();
                        },
                        dep /* dependency name */);
            } else {

                this.register(this.source, dep, resolver.nameService.stripAlias(dep));
                this.update();
            }


        }

    };

    DependencyManager.prototype.register = function(source, depName) {

        var aModule = resolver.resolve(source, resolver.nameService.stripAlias(depName), {action: 'get'});
        this.data[resolver.nameService.module(depName)] = aModule;

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
