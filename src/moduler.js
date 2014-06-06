define(['resolver', 'util', 'constant', 'foundation'], function(resolver, util, Constant, foundation) {

    'use strict';

    var bindDefineModule = null;
    var moduleManager = function(ns) {

        var modules = {};

        // augument default "modules" object with foundation's methods
        util.mixin(modules, foundation.modules);

        var config = {};

        var setup = function(fn) {
            fn(config);
        };

        ns.define = function(name, fn, deps) {
            return define.call(modules, name, fn, deps);
        };
        ns.require = function(deps, options, fn) {
            return require.call(modules, deps, options, fn);
        };
        ns.getModules = function() {
            return modules;
        };
        ns.setup = setup;

    };

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

        resolver.define(this/*source*/, name, fn, deps, base);

    };

    var require = function(deps, options, fn) {

        if (!util.isArray(deps)) {
            throw new Error('Dependencies must be supplied as an array.');
        }

        options = options || {};

        // we resovle currently empty object, if necessary we can augment exist module
        return resolver.require(this/*source*/, deps, options.base || {}, fn);

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
        },
        bindDefine: function(target, isNs) {
            if (isNs) {
                bindDefineModule = target.getModules();
            } else {
                bindDefineModule = target;
            }
        },
        define: function(name, fn, deps) {
            if (bindDefineModule === null) {
                console.warn('Bind Define module is not set');
            }
            return define.call(bindDefineModule, name, fn, deps);

        }
    };

});
