define(['resolver', 'util', 'constant', 'foundation'], function(resolver, util, Constant, foundation) {

    'use strict';

    var bindDefineModule = null;

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
        extendCtor: util.extendCtor
    };

    var define = function(name, fn, deps) {

        deps = deps || [];

        if (!name) {
            throw new Error('Module name is required when defining a module.');
        }

        if (!util.isArray(deps)) {
            throw new Error('Dependencies must be supplied as an array.');
        }

        resolver.define(this/*source*/, name, fn, deps, base);

    };

    var require = function(deps, fn, ready, options) {

        if (!util.isArray(deps)) {
            throw new Error('Dependencies must be supplied as an array.');
        }

        options = options || {};

        // we resovle currently empty object, if necessary we can augment exist module
        return resolver.require(this/* source */, deps, fn, ready, options);

    };

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
        ns.require = function(deps, fn, ready, options) {
            return require.call(modules, deps, fn, ready, options);
        };
        ns.debug = {
            getModules: function() {
                return modules;
            },
            showFoundation: function() {
                return foundation;
            }
        };
        ns.setup = setup;

        return ns;
    };

    // api
    return {
        create: function(ns) {

            if (!ns) {
                throw new Error('An object must be specified.');
            }
            return moduleManager(ns);
        },
        exports: function(target, name, obj) {
            return resolver.exports(target, name, obj);
        },
        extend: function(name, fn) {
            foundation.register(name, fn, base);
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
