;(function() {
var scriptLoader, dependencyManager, resolver, util, constant, foundation, moduler;
(function () {
    scriptLoader = function () {
        var ScriptLoader = function (url, ns, onLoadCallback, name) {
            this.url = url;
            /* url of the module */
            this.ns = ns;
            /* source obj/ns obj to bind 'define' method */
            this.onLoadCallback = onLoadCallback;
            this.name = name;
            this.load();
        };
        // TODO: add cross-browser support
        ScriptLoader.prototype.load = function () {
            var script = document.createElement('script');
            var that = this;
            script.src = this.url;
            moduler.bindDefine(this.ns);
            script.onload = function () {
                that.onLoadCallback(that.name);
            };
            document.head.appendChild(script);
        };
        return ScriptLoader;
    }();
    dependencyManager = function (SL) {
        /**
         * Dependency manager constructor
         * A dep manager only need the source Object and a list of dependency
         * TODO: add options
         *
         * @return object
         */
        var DependencyManager = function (source, deps) {
            this.source = source;
            // source of where objs are attached to
            this.deps = deps;
            // input deps
            this.count = 0;
            // hold deps counts
            this.data = {};
        };
        // TODO: move to path manager
        var baseUrl = 'http://localhost:8888/js/modules/';
        /**
         * Try resolving all Deps
         *
         * @return undefined
         */
        DependencyManager.prototype.resolve = function () {
            var i, len, dep, aModule, moduleName, that = this;
            // if no deps needed, then just call ready callback
            if (this.deps.length === 0) {
                this.ready();
            }
            for (i = 0, len = this.deps.length; i < len; i++) {
                dep = this.deps[i];
                moduleName = resolver.nameService.stripAlias(dep);
                this.data[resolver.nameService.module(dep)] = null;
                aModule = resolver.resolve(this.source, moduleName, { action: 'get' });
                // give warning if the resolved module is empty
                if (typeof aModule === 'undefined') {
                    // load module remotely
                    new SL(baseUrl + moduleName + '.js', this.source, function (name) {
                        /* callback for some script loader */
                        that.register(name);
                    }, dep);
                } else {
                    this.register(dep, moduleName);
                }
            }
        };
        /**
         * Try to register a module, call back script loader's onload callback
         *
         * this function is used as callback for script "onload" event
         * if the script is ready, this function will be run
         *
         * @return undefined
         */
        DependencyManager.prototype.register = function repeat(depName) {
            var aModule = resolver.resolve(this.source, resolver.nameService.stripAlias(depName), { action: 'get' });
            var that = this;
            if (!aModule) {
                // if the module at this point is "undefined" that means the loaded module has dependencies of other modules
                // so register a recursive call to check the availablity of it's dependencies until it become available
                // then to update
                setTimeout(function () {
                    repeat.call(that, depName);
                }, 15);
            } else {
                // resolve one module, at this point we are sure, there is a value of "aModule"
                this.data[resolver.nameService.module(depName)] = aModule;
                // if any dependency is resolved, update call will be fired to check whether all dependencies are loaded
                // if yes, ready callback will by fired.
                this.update();
            }
        };
        /**
         * Interface method
         *
         * @return error
         */
        DependencyManager.prototype.ready = function () {
            throw new Error('This method need to be implemented. Cannot be call from here.');
        };
        /**
         * Register ready callback, when all dependencies are loaded,
         * run the callbacks and passing dependency collection
         *
         * @return function
         */
        DependencyManager.prototype.registerReadyCb = function (fn) {
            var that = this;
            return function () {
                fn(that.data);
            };
        };
        /**
         * If any dep is resolved, this method should be called
         * with each invocation, it will check wheather all deps are met,
         * if yes, excute the ready callback
         *
         * @return undefined
         */
        DependencyManager.prototype.update = function () {
            this.count = this.count + 1;
            if (this.count === this.deps.length) {
                this.ready();
            }
        };
        return DependencyManager;
    }(scriptLoader);
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
                throw new Error('Unsupported action.');
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
        function formatDeps(source) {
            var deps = [];
            for (var dep in source) {
                if (source.hasOwnProperty(dep)) {
                    if (this) {
                        this[dep] = source[dep];
                    }
                    deps.push(source[dep]);
                }
            }
            return deps;
        }
        function define(source, name, fn, deps, base) {
            var dm = new DM(source, deps);
            dm.ready = dm.registerReadyCb(function (data) {
                var deps = formatDeps.call(null, data);
                exports(source, name, fn.apply(base, deps));
            });
            dm.resolve();
        }
        function require(source, deps, target, fn) {
            var dm = new DM(source, deps);
            // define a ready callback with "registerReadyCb" function provided by DependencyManager object
            dm.ready = dm.registerReadyCb(function (data) {
                var deps = formatDeps.call(target, data);
                if (fn) {
                    fn.apply(null, deps);
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
            ns.require = function (deps, options, fn) {
                return require.call(modules, deps, options, fn);
            };
            ns.getModules = function () {
                return modules;
            };
            ns.setup = setup;
            return ns;
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
        var require = function (deps, options, fn) {
            if (!util.isArray(deps)) {
                throw new Error('Dependencies must be supplied as an array.');
            }
            options = options || {};
            // we resovle currently empty object, if necessary we can augment exist module
            return resolver.require(this, deps, options.base || {}, fn);
        };
        // api
        return {
            create: function (ns) {
                if (!ns) {
                    throw new Error('An object must be specified.');
                }
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