define(['resolver', 'util', 'constant', 'foundation'], function(resolver, util, Constant, foundation) {

    'use strict';

    var bindDefineModule = null;

    // will be bind with 'this' when defining modules
    var utilHelper = {
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

        // delegate define method to resolver's define
        resolver.define(this/* envelop */, name, fn, deps);

    };

    var require = function(deps, fn, ready, options) {

        if (!util.isArray(deps)) {
            throw new Error('Dependencies must be supplied as an array.');
        }

        options = options || {};

        // delegate require moethod to resolver's require method
        return resolver.require(this/* envelop */, deps, fn, ready, options);

    };

    var moduleManager = function(ns) {

        // private module container
        var modules = {};

        // augument default "modules" object with foundation's methods
        util.mixin(modules, foundation.modules);

        var config = {};

        var setup = function(fn) {
            fn(config);
        };

        var constant = (function() {
            var constant = new Constant();
            return {
                get: constant.get,
                set: constant.set
            };
        }());

        var envelop = {
            modules: modules,
            util: utilHelper,
            config: config,
            constant: constant
        };

        /**
         * Attach define to module
         */
        ns.define = function(name, fn, deps) {
            return define.call(envelop, name, fn, deps);
        };

        /**
         * Attach require to module
         */
        ns.require = function(deps, fn, ready, options) {
            return require.call(envelop, deps, fn, ready, options);
        };

        /**
         * Give module a constant function
         */
        ns.constant = constant;

        /**
         * Give module some debug methods
         */
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
            foundation.register(name, fn);
        },
        bindDefine: function(target) {
            bindDefineModule = target;
        },
        define: function(name, fn, deps) {

            if (bindDefineModule === null) {
                console.warn('Bind Define module is not set');
            }
            return define.call(bindDefineModule, name, fn, deps);
        }
    };
});
