;(function() {
var resolver, util, constant, foundation, moduler;
(function () {
    resolver = function () {
        var MODULE_NAME_REGEX = /(\S+?)\.(\S+)/;
        var MODULE_ALIAS_REGEX = /(\S+)\ as\ (\w+)/;
        function resolve(target, name, options) {
            var parse, hasSubmodule;
            options = options || { action: 'get' };
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
            return alias ? alias[1] : name;
        }
        /**
         * exports function, delegate to set action of resolve function
         */
        function exports(target, name, obj) {
            return resolve(target, name, {
                action: 'set',
                obj: obj
            });
        }
        // api
        return {
            resolve: resolve,
            moduleName: moduleName,
            aliasName: aliasName,
            'exports': exports
        };
    }();
    util = function () {
        var hasOwn = Object.prototype.hasOwnProperty;
        var ostring = Object.prototype.toString;
        var nativeForEach = Array.prototype.forEach;
        function hasProp(obj, prop) {
            hasOwn.call(obj, prop);
        }
        function isArray(obj) {
            return ostring.call(obj) === '[object Array]';
        }
        function isFunction(fn) {
            return ostring.call(fn) === '[object Function]';
        }
        function each(obj, fn, context) {
            /* jshint eqnull:true */
            if (obj == null) {
                return obj;
            }
            if (nativeForEach && obj.forEach === nativeForEach) {
                obj.forEach(fn, context);
            } else if (obj.length === +obj.length) {
                for (var i = 0, length = obj.length; i < length; i++) {
                    fn.call(context, obj[i], i, obj);
                }
            } else {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        fn.call(context, obj[key], key, obj);
                    }
                }
            }
            return obj;
        }
        function mixin(target, source, force, deepStringMixin) {
            if (source) {
                each(source, function (value, prop) {
                    if (force || !hasProp(target, prop)) {
                        if (deepStringMixin && typeof value === 'object' && value && !isArray(value) && !isFunction(value) && !(value instanceof RegExp)) {
                            if (!target[prop]) {
                                target[prop] = {};
                            }
                            mixin(target[prop], value, force, deepStringMixin);
                        } else {
                            target[prop] = value;
                        }
                    }
                });
            }
            return target;
        }
        /**
         * Inherit constructors
         *
         * @param function Child Child constructor function, if null specified, constructor will be empty fn
         * @param function Parent Parent construtor to inherit from
         *
         * @return function Child constructor
         */
        function inherit(Child, Parent) {
            if (!Parent || typeof Parent !== 'function') {
                throw new Error('Second parameter expects to be a constructor function');
            }
            if (Child === null) {
                Child = function () {
                };
            }
            var F = function () {
            };
            F.prototype = Parent.prototype;
            Child.prototype = new F();
            Child.prototype.constructor = Child;
            return Child;
        }
        return {
            isArray: isArray,
            each: each,
            inherit: inherit,
            mixin: mixin
        };
    }();
    constant = function () {
        /**
         * Constant constructor function
         *
         * @return object
         */
        var Constant = function () {
        };
        /**
         * getter
         *
         * @return mixed
         */
        Constant.prototype.get = function (name) {
            return this[name];
        };
        /**
         * Setter
         *
         * @return boolean
         */
        Constant.prototype.set = function (name, value) {
            var status = false;
            if (typeof this[name] === 'undefined') {
                this[name] = value;
                status = true;
            } else {
                console.warn('try to set again the constant: ' + this[name]);
            }
            return status;
        };
        return Constant;
    }();
    foundation = function () {
        var foundation = {
                modules: {},
                register: function (name, fn, deps) {
                    // TODO
                    // resolve deps
                    // export to this.modules.name = fn.apply(null, [deps]);
                    resolver.exports(this.modules, name, fn.call(null, this.modules));
                }
            };
        return foundation;
    }();
    moduler = function (Constant) {
        
        var moduleManager = function (ns) {
            var modules = {};
            util.mixin(modules, foundation.modules);
            var config = {};
            var base = {
                    constant: function () {
                        var constant = new Constant();
                        return {
                            get: constant.get,
                            set: constant.set
                        };
                    }(),
                    inherit: util.inherit,
                    mixin: util.mixin,
                    each: util.each,
                    exports: util.exports
                };
            var define = function (name, fn, deps) {
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
                    aModule = resolver.resolve(modules, dep, { action: 'get' });
                    if (!aModule) {
                        console.warn('Fail to inject dependency named: "' + dep + '".');
                    }
                    args.push(aModule);
                }
                resolver.exports(modules, name, fn.apply(base, args));
            };
            var require = function (deps, options) {
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
                        target[resolvedName] = resolver.resolve(modules, resolver.aliasName(dep), { action: 'get' });
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
            var setup = function (fn) {
                fn(config);
            };
            ns.define = define;
            ns.require = require;
            ns.setup = setup;
        };
        // api
        return {
            create: function (ns) {
                return moduleManager(ns);
            },
            exports: function (target, name, obj) {
                return resolver.exports(target, name, obj);
            },
            extend: function (name, fn) {
                foundation.register(name, fn);
            },
            debug: function () {
                console.dir(foundation);
            }
        };
    }(constant);
}());
window.moduler = moduler;
}());