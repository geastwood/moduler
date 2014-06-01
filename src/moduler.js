define(['resolver', 'util', 'constant', 'foundation'], function(resolver, util, Constant, foundation) {

    'use strict';

    var moduleManager = function(ns) {

        var modules = {};

        // augument default "modules" object with foundation's methods
        util.mixin(modules, foundation.modules);

        var config = {};

        // will be bind with 'this' when defining modules
        var base = {
            constant: (function() {
                var constant = new Constant();
                return {
                    get: constant.get,
                    set: constant.set
                };
            }()),
            inherit: util.inherit,
            mixin: util.mixin,
            each: util.each,
            exports: util.exports,
            extendCtor: util.extendCtor
        };

        var define = function(name, fn, deps) {

            var args;
            deps = deps || [];

            if (!name) {
                throw new Error('Module name is required when defining a module.');
            }

            if (!util.isArray(deps)) {
                throw new Error('Dependencies must be supplied as an array.');
            }

            args = resolver.resolveDeps(modules, deps);

            resolver.exports(modules, name, fn.apply(base, args));

        };

        var require = function(deps, options) {

            if (!util.isArray(deps)) {
                throw new Error('Dependencies must be supplied as an array.');
            }

            options = options || {};

            // we resovle currently empty object, if necessary we can augment exist module
            return resolver.attach(modules, deps, options.base || {});

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
