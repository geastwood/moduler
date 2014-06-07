/**
 * resolver
 * use to resolve namespaces
 * set or get object for namespaces
 */
define(['dependencyManager'], function(DM) {

    var nameService = (function () {

        var MODULE_NAME_REGEX = /(\S+?)\.(\S+)/;
        var MODULE_ALIAS_REGEX = /(\S+)\ as\ (\w+)/;

        return {

            module: function(name) {

                var alias = MODULE_ALIAS_REGEX.exec(name);
                var submodules;

                // if there is alias name
                if (alias) {
                    return alias[2];
                } else {

                    // if there is a submodule
                    submodules = MODULE_NAME_REGEX.exec(name);

                    if (submodules) {
                        return name.split('.').pop();
                    }

                    return name;
                }
            },
            parseModule: function(name) {
                return MODULE_NAME_REGEX.exec(name);
            },
            stripAlias: function(name) {
                var alias = MODULE_ALIAS_REGEX.exec(name);
                return (alias) ? alias[1] : name;
            }
        };
    }());

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
        parse = nameService.parseModule(name);
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

    function define(source, name, fn, deps, base) {

        var dm = new DM(source, deps);
        dm.ready = dm.registerReadyCb(function(data) {
            var deps = formatDeps(data);
            exports(source, name, fn.apply(base, deps));
        });
        dm.resolve();
    }

    function require(source, deps, target, fn) {

        var dm = new DM(source, deps);

        // define a ready callback with "registerReadyCb" function provided by DependencyManager object
        dm.ready = dm.registerReadyCb(function(data) {
            var deps = formatDeps(data, target);

            if (fn) {
                fn.apply(null, deps);
            }
        });

        dm.resolve();
        return target;
    }

    // api
    return {
        resolve: resolve,
        nameService: nameService,
        define: define,
        require: require,
        exports: exports
    };

});
