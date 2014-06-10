/**
 * resolver
 * use to resolve namespaces
 * use for delegations of define and require method
 * set or get object for namespaces
 */
define(['dependencyManager', 'pathManager'], function(DM, pm) {

    /**
     * Resolve namespace with "get" or "set" methods
     */
    function resolve(target, name, options) {

        var parse, hasSubmodule;
        options = options || {action: 'get'};

        if (!name) {
            throw new Error('module name must be specified.');
        }

        // here name doesn't have alias
        parse = pm.hasSubmodule(name);
        hasSubmodule = parse !== null;

        if (hasSubmodule) {

            target[parse[1]] = target[parse[1]] || {};

            // recursively solve the namespace
            return resolve(target[parse[1]], parse[2], options);
        }

        if (options.action === 'get') {
            return target[name];
        } else if (options.action === 'set') {

            if (typeof options.obj === undefined) {
                throw new Error('Set action with an empty object.');
            }

            target[name] = options.obj;
            return true;
        } else {
            throw new Error('Unsupported action.');
        }

    }

    /**
     * exports function, delegate to set action of resolve function
     */
    function exports(target, name, obj) {
        return resolve(target, name, {action: 'set', obj: obj});
    }

    /**
     * Format return dependency data
     */
    function formatDeps(source, target) {
        var deps = [];

        for (var dep in source) {
            if (source.hasOwnProperty(dep)) {
                if (target) {
                    target[dep] = source[dep];
                }
                deps.push(source[dep]);
            }
        }

        return deps;
    }

    /**
     * Format the object will be bind with "this" keywork within "define" and "require"
     *
     * @return object
     */
    function buildBind(source) {
        return {
            constant: source.constant,
            config: source.config,
            util: source.util
        };
    }

    function define(source, name, fn, deps) {

        // use a new dependencyManager to resolver the dependencies
        var dm = new DM(source, deps);

        // define a ready callback with "registerReadyCb" function provided by DependencyManager object
        dm.ready = dm.registerReadyCb(function(data) {
            var deps = formatDeps(data);
            exports(source.modules, name, fn.apply(buildBind(source), deps));
        });

        // resolve the dependency
        dm.resolve();
    }

    function require(source, deps, fn, ready) {

        // use a new dependencyManager to resolver the dependencies
        var dm = new DM(source, deps);

        // define a ready callback with "registerReadyCb" function provided by DependencyManager object
        dm.ready = dm.registerReadyCb(function(data) {
            var deps = formatDeps(data),
                bind = buildBind(source),
                rst = fn.apply(bind, deps);

            if (ready) { // call ready callback, if there is one
                ready.call(bind, rst);
            }
        });

        // resolve the dependency
        dm.resolve();
    }

    // api
    return {
        resolve: resolve,
        define: define,
        require: require,
        exports: exports
    };
});
