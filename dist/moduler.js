;(function() {
var scriptLoader, dependencyManager, resolver, util, constant, foundation, moduler;
(function () {
    scriptLoader = function () {
        var scriptLoader = function (url, ns, fn) {
            this.url = url;
            this.ns = ns;
            this.fn = fn;
        };
        scriptLoader.prototype.load = function () {
            var script = document.createElement('script');
            script.src = url;
            moduler.bindDefine(ns);
            document.head.appendChild(script);
        };
        return scriptLoader;
    }();
    dependencyManager = function () {
        var DependencyManager = function (source, deps) {
            this.source = source;
            this.deps = deps;
            this.count = 0;
            this.data = {
                deps: [],
                names: []
            };
        };
        DependencyManager.prototype.resolve = function () {
            var i, len, dep, resolvedName, aModule;
            if (this.deps.length === 0) {
                this.ready();
            }
            for (i = 0, len = this.deps.length; i < len; i++) {
                dep = this.deps[i];
                aModule = resolver.resolve(this.source, resolver.nameService.stripAlias(dep), { action: 'get' });
                // give warning if the resolved module is empty
                if (typeof aModule === 'undefined') {
                    console.warn('module with the name "' + dep + '" is not found.');
                }
                this.data.names.push(resolver.nameService.module(dep));
                this.data.deps.push(aModule);
                this.update();
            }
        };
        DependencyManager.prototype.ready = function (fn) {
            var that = this;
            return function () {
                fn(that.data);
            };
        };
        DependencyManager.prototype.update = function () {
            this.count = this.count + 1;
            if (this.count === this.deps.length) {
                this.ready();
            }
        };
        return DependencyManager;
    }();
    resolver = function (DM) {
        var nameService = function () {
                var MODULE_NAME_REGEX = /(\S+?)\.(\S+)/;
                var MODULE_ALIAS_REGEX = /(\S+)\ as\ (\w+)/;
                return {
                    module: function (name) {
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
                    parseModule: function (name) {
                        return MODULE_NAME_REGEX.exec(name);
                    },
                    stripAlias: function (name) {
                        var alias = MODULE_ALIAS_REGEX.exec(name);
                        return alias ? alias[1] : name;
                    }
                };
            }();
        /**
         * Resolve namespace with "get" or "set" methods
         */
        function resolve(target, name, options) {
            var parse, hasSubmodule;
            options = options || { action: 'get' };
            if (!name) {
                throw new Error('module name must be specified.');
            }
            // here name doesn't have alias
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
            return resolve(target, name, {
                action: 'set',
                obj: obj
            });
        }
        function define(source, name, fn, deps, base) {
            var dm = new DM(source, deps);
            dm.ready = dm.ready(function (data) {
                exports(source, name, fn.apply(base, data.deps));
            });
            dm.resolve();
        }
        /* this base is a bit different*/
        function require(source, deps, target) {
            var dm = new DM(source, deps, target);
            dm.ready = dm.ready(function (data) {
                for (var i = 0, len = data.names.length; i < len; i++) {
                    target[data.names[i]] = data.deps[i];
                }
            });
            dm.resolve();
            return target;
        }
        // api
        return {
            resolve: resolve,
            nameService: nameService,
            define: define,
            require: require,
            exports: exports
        };
    }(dependencyManager);
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
        /**
         * each, forEach implementation
         *
         * @return object Looping object
         */
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
        /**
         * Mixin/extend implementation
         *
         * @return object target object
         */
        function mixin(target, source, force, deepStringMixin) {
            if (source) {
                each(source, function (value, prop) {
                    if (force || !hasProp(target, prop)) {
                        // if deep copy, perform recursive call
                        if (deepStringMixin && typeof value === 'object' && value && !isFunction(value) && !(value instanceof RegExp)) {
                            if (!target[prop]) {
                                if (isArray(value)) {
                                    target[prop] = [];
                                } else {
                                    target[prop] = {};
                                }
                            }
                            // recursive
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
        // extend constructor function
        function extendCtor(Ctor) {
            return function (obj, deep) {
                var o = new Ctor();
                mixin(o, obj, false, deep);
                return o;
            };
        }
        // api
        return {
            isArray: isArray,
            each: each,
            inherit: inherit,
            mixin: mixin,
            extendCtor: extendCtor
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
        
        var bindDefineModule = null;
        var moduleManager = function (ns) {
            var modules = {};
            // augument default "modules" object with foundation's methods
            util.mixin(modules, foundation.modules);
            var config = {};
            var setup = function (fn) {
                fn(config);
            };
            ns.define = function (name, fn, deps) {
                return define.call(modules, name, fn, deps);
            };
            ns.require = function (deps, options) {
                return require.call(modules, deps, options);
            };
            ns.getModules = function () {
                return modules;
            };
            ns.setup = setup;
        };
        // will be bind with 'this' when defining modules
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
                exports: util.exports,
                extendCtor: util.extendCtor
            };
        var define = function (name, fn, deps) {
            var args;
            deps = deps || [];
            if (!name) {
                throw new Error('Module name is required when defining a module.');
            }
            if (!util.isArray(deps)) {
                throw new Error('Dependencies must be supplied as an array.');
            }
            resolver.define(this, name, fn, deps, base);
        };
        var require = function (deps, options) {
            if (!util.isArray(deps)) {
                throw new Error('Dependencies must be supplied as an array.');
            }
            options = options || {};
            // we resovle currently empty object, if necessary we can augment exist module
            return resolver.require(this, deps, options.base || {});
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
            },
            bindDefine: function (target, isNs) {
                if (isNs) {
                    bindDefineModule = target.getModules();
                } else {
                    bindDefineModule = target;
                }
            },
            define: function (name, fn, deps) {
                if (bindDefineModule === null) {
                    console.warn('Bind Define module is not set');
                }
                return define.call(bindDefineModule, name, fn, deps);
            }
        };
    }(constant);
}());
window.moduler = moduler;
}());