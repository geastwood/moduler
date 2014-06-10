define(['resolver', 'scriptLoader', 'pathManager'], function(resolver, SL, pathManager) {

    /**
     * Dependency manager constructor
     * A dep manager only need the source Object and a list of dependency
     * TODO: add options
     *
     * @return object
     */
    var DependencyManager = function(source, deps) {
        this.source = source; // source of where objs are attached to
        this.deps = deps; // input deps
        this.count = 0; // hold deps counts
        this.data = {}; // hold deps data, name and objects
    };

    var baseUrl = 'http://localhost:8888/js/modules/';

    /**
     * Try resolving all Deps
     *
     * @return undefined
     */
    DependencyManager.prototype.resolve = function() {

        var i, len,
            dep,
            aModule,
            moduleName,
            that = this;

        // if no deps needed, then just call ready callback
        if (this.deps.length === 0) {
            this.ready();
        }

        for (i = 0, len = this.deps.length; i < len; i++) {

            dep = this.deps[i];

            // simple module name without deep namespace
            moduleName = pathManager.moduleName(dep);
            this.data[moduleName] = null;
            aModule = resolver.resolve(this.source.modules, pathManager.fullModuleName(dep), {action: 'get'});

            // give warning if the resolved module is empty
            if (typeof aModule === 'undefined') {

                // load module remotely
                new SL(pathManager.path(dep)/* url */,
                        this.source/* modules */,
                        function(name) { /* callback for some script loader */
                            that.register(name);
                        },
                        dep /* dependency name */);
            } else {
                this.register(dep, moduleName);
            }

        }

    };

    /**
     * Try to register a module, call back script loader's onload callback
     *
     * this function is used as callback for script "onload" event
     * if the script is ready, this function will be run
     *
     * @return undefined
     */
    DependencyManager.prototype.register = function repeat(dep) {

        var aModule = resolver.resolve(this.source.modules, pathManager.fullModuleName(dep), {action: 'get'}),
            that = this;

        if (!aModule) {

            // if the module at this point is "undefined" that means the loaded module has dependencies of other modules
            // so register a recursive call to check the availablity of it's dependencies until it become available
            // then to update
            setTimeout(function() {
                repeat.call(that, dep);
            }, 15);
        } else {
            // resolve one module, at this point we are sure, there is a value of "aModule"
            this.data[pathManager.moduleName(dep)] = aModule;
            // if any dependency is resolved, update call will be fired to check whether all dependencies are loaded
            // if yes, ready callback will by fired.
            this.update();
        }

    };

    /**
     * Interface method
     *
     * @return error
     */
    DependencyManager.prototype.ready = function() {
        throw new Error('This method need to be implemented. Cannot be call from here.');
    };

    /**
     * Register ready callback, when all dependencies are loaded,
     * run the callbacks and passing dependency collection
     *
     * @return function
     */
    DependencyManager.prototype.registerReadyCb = function(fn) {
        var that = this;
        return function() {
            fn(that.data);
        };
    };

    /**
     * If any dep is resolved, this method should be called
     * with each invocation, it will check wheather all deps are met,
     * if yes, excute the ready callback
     *
     * @return undefined
     */
    DependencyManager.prototype.update = function() {
        this.count = this.count + 1;
        if (this.count === this.deps.length) {
            this.ready();
        }
    };

    return DependencyManager;
});
