define(['resolver', 'util', 'constant', 'foundation'], function(resolver, util, Constant, foundation) {

    'use strict';

    var bindDefineModule = null;

    /**
     * Delegate to resolver.define
     * This function is for some valiations
     */
    var define = function(name, fn, deps) {

        deps = deps || [];

        if (!name) {
            throw new Error('Module name is required when defining a module.');
        }

        if (!util.isArray(deps)) {
            throw new Error('Dependencies must be supplied as an array.');
        }

        // delegate define method to resolver's define
        resolver.define(this/* envelope */, name, fn, deps);
    };

    /**
     * Delegate to resolver.require
     * This function is for some validations
     */
    var require = function(deps, fn, ready, options) {

        if (!util.isArray(deps)) {
            throw new Error('Dependencies must be supplied as an array.');
        }

        options = options || {};

        // delegate require moethod to resolver's require method
        return resolver.require(this/* envelope */, deps, fn, ready, options);
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

        /**
         * envelope will be passed through during the module resolve process,
         * if certain data need to be passed around, can be attached to this object
         */
        var envelope = {
            modules: modules,
            util: util,
            config: config,
            constant: constant
        };

        /**
         * Attach define to module, first delegate to define method in 'moduler', then to 'resolver.define'
         * "this" will be binded with "envelope" object
         *
         * @param name      String      name of the module
         * @param ready     Function    Module defining function, which returns the object
         * @param deps      Array       array of dependencies
         *
         * @return undefined
         */
        ns.define = function(name, fn, deps) {
            return define.call(envelope, name, fn, deps);
        };

        /**
         * Attach require to module, first delegate to require method in 'moduler', then to 'resolver.require'
         * "this" will be binded with "envelope" object
         *
         * @param deps      Array       collection of dependencies
         * @param fn        Function    callback
         * @param ready     Function    ready callback, called when loaded module is ready
         * @param options   Object      options
         *
         * @return undefined
         */
        ns.require = function(deps, fn, ready, options) {
            return require.call(envelope, deps, fn, ready, options);
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
                console.warn('Bind Define module is not set.');
            }
            return define.call(bindDefineModule, name, fn, deps);
        }
    };
});
