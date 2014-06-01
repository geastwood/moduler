/**
 * resolver
 * use to resolve namespaces
 * set or get object for namespaces
 */
define(function() {

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

        // here name doesn't has alias
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
            throw new Error('Failed to resolve.');
        }

    }


    /**
     * exports function, delegate to set action of resolve function
     */
    function exports(target, name, obj) {
        return resolve(target, name, {action: 'set', obj: obj});
    }

    /**
     * Attach deps from source to target
     *
     * @return object target object
     */
    function attach(source, target, deps) {

        var i, len, dep, resolvedName;
        target = target || {};

        for (i = 0, len = deps.length; i < len; i++) {

            dep = deps[i];

            // resolve the dependency name, parse deep namespace or alias
            resolvedName = nameService.module(dep);

            // assign resolved module to resolved name
            // when resolve strip all alias name, keep only the 'name.spcae.to.resolve'
            target[resolvedName] = resolve(source, nameService.stripAlias(dep), {action: 'get'});

            // give warning if the resolved module is empty
            if (typeof target[resolvedName] === 'undefined') {
                console.warn('module with the name "' + dep + '" is not found.');
            }

        }

        /*

        for (i = 0, len = deps.length; i < len; i++) {

            dep = deps[i];

            aModule = resolver.resolve(modules, dep, {action: 'get'});

            if (!aModule) {
                console.warn('Fail to inject dependency named: "' + dep + '".');
            }

            args.push(aModule);

        }

        */

        return target;
    }

    // api
    return {
        resolve: resolve,
        /*resolveDep: resolveDep,*/
        attach: attach,
        exports: exports
    };

});
