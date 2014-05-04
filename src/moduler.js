var moduler = (function() {

    'use strict';

    var isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    var resolver = (function() {

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

        function aliasName(name) {
            var alias = MODULE_ALIAS_REGEX.exec(name);
            return (alias) ? alias[1] : name;
        }

        return {
            resolve: resolve,
            moduleName: moduleName,
            aliasName: aliasName
        };

    }());

    var exports = function(target, name, obj) {
        return resolver.resolve(target, name, {action: 'set', obj: obj});
    };

    var moduleManager = function(ns) {

        var modules = {};

        var define = function(name, fn, deps) {

            var args = [], i, len, dep, aModule;

            if (!name) {
                throw new Error('Module name is required when defining a module.');
            }

            deps = deps || [];

            if (!isArray(deps)) {
                throw new Error('Dependencies must be supplied as an array.');
            }

            for (i = 0, len = deps.length; i < len; i++) {

                dep = deps[i];

                aModule = resolver.resolve(modules, dep, {action: 'get'});

                if (!aModule) {
                    console.warn('Fail to inject dependency named: "' + dep + '".');
                }

                args.push(aModule);

            }

            exports(modules, name, fn.apply(null, args));

        };

        var require = function(deps, options) {

            if (!isArray(deps)) {
                throw new Error('Dependencies must be supplied as an array.');
            }

            options = options || {};

            // resove dependencies
            function resolve(target, deps) {

                var i, len, dep, resolvedName;
                target = target || {};

                for (i = 0, len = deps.length; i < len; i++) {

                    dep = deps[i];

                    // resolve the dependency name, parse deep namespace or alias
                    resolvedName = resolver.moduleName(dep);

                    // assign resolved module to resolved name
                    target[resolvedName] = resolver.resolve(modules, resolver.aliasName(dep), {action: 'get'});

                    // give warning if the resolved module is empty
                    if (typeof target[resolvedName] === 'undefined') {
                        console.warn('module with the name "' + dep + '" is not found.');
                    }

                }

                return target;
            }

            // we resovle currently empty object, if necessary we can augment exist module
            return resolve(options.base || {}, deps);

        };

        ns.define = define;
        ns.require = require;

    };

    // api
    return {
        create: function(ns) {
            return moduleManager(ns);
        },
        exports: function(target, name, obj) {
            return exports(target, name, obj);
        },
        extend: function() {}
    };

}());
