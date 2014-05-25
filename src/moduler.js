define(['resolver', 'util', 'constant', 'foundation'], function(resolver, util, Constant, foundation) {

    'use strict';

    var moduleManager = function(ns) {

        var modules = {};

        util.extend(foundation.modules, modules);

        var config = {};
        var base = {
            constant: (function() {
                var constant = new Constant();
                return {
                    get: constant.get,
                    set: constant.set
                };
            }()),
            inherit: util.inherit,
            extend: util.extend,
            each: util.each,
            exports: util.exports
        };

        var define = function(name, fn, deps) {

            var args = [], i, len, dep, aModule;

            if (!name) {
                throw new Error('Module name is required when defining a module.');
            }

            deps = deps || [];

            if (!util.isArray(deps)) {
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

            resolver.exports(modules, name, fn.apply(base, args));

        };

        var require = function(deps, options) {

            if (!util.isArray(deps)) {
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

        var setup = function(fn) {
            fn(config);
        };

        ns.define = define;
        ns.require = require;
        ns.setup = setup;

    };

    // api
    return {
        create: function(ns) {
            return moduleManager(ns);
        },
        exports: function(target, name, obj) {
            return resolver.exports(target, name, obj);
        },
        extend: function(name, fn) {
            foundation.register(name, fn);
        },
        debug: function() {
            console.dir(foundation);
        }
    };

});
