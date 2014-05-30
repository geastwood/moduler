/**
 * resolver
 * use to resolve namespaces
 * set or get object for namespaces
 */
define(function() {

    var MODULE_NAME_REGEX = /(\S+?)\.(\S+)/;
    var MODULE_ALIAS_REGEX = /(\S+)\ as\ (\w+)/;

    function resolve(target, name, options) {

        var parse, hasSubmodule;
        options = options || {action: 'get'};

        if (!name) {
            throw new Error('module name must be specified.');
        }

        parse = MODULE_NAME_REGEX.exec(name);
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
     * resolve module name
     *
     * @return string
     */
    function moduleName(name) {

        var alias = MODULE_ALIAS_REGEX.exec(name);
        var submodules;

        if (alias) {
            return alias[2];
        } else {

            submodules = MODULE_NAME_REGEX.exec(name);

            if (submodules) {
                return name.split('.').pop();
            }

            return name;

        }
    }

    /**
     * Resolve alias name
     *
     * @return string
     */
    function aliasName(name) {
        var alias = MODULE_ALIAS_REGEX.exec(name);
        return (alias) ? alias[1] : name;
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
            resolvedName = moduleName(dep);

            // assign resolved module to resolved name
            target[resolvedName] = resolve(source, aliasName(dep), {action: 'get'});

            // give warning if the resolved module is empty
            if (typeof target[resolvedName] === 'undefined') {
                console.warn('module with the name "' + dep + '" is not found.');
            }

        }

        return target;
    }

    // api
    return {
        resolve: resolve,
        attach: attach,
        'exports': exports
    };

});
