;(function() {
var util, pathManager, scriptLoader, dependencyManager, resolver, constant, foundation, Modulerjs;
(function () {
    util = function () {
        var hasOwn = Object.prototype.hasOwnProperty, ostring = Object.prototype.toString, nativeForEach = Array.prototype.forEach;
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
    pathManager = function () {
        var MODULE_NAME_REGEX = /(\S+?)\.(\S+)/;
        var config = { baseUrl: 'http://localhost:8888/js/modules/' };
        return {
            config: function (options) {
                util.mixin(config, options, false, true);
            },
            path: function (name) {
                var url = config.baseUrl + name.replace('.', '/') + '.js';
                return url;
            },
            /**
             * Get the module name, if namespace only take the last one
             *
             * @return string
             */
            moduleName: function (name) {
                var submodules = this.hasSubmodule;
                if (submodules) {
                    return name.split('.').pop();
                }
                return name;
            },
            hasSubmodule: function (name) {
                return MODULE_NAME_REGEX.exec(name);
            },
            fullModuleName: function (name) {
                return name;
            }
        };
    }();
    scriptLoader = function () {
        var ScriptLoader = function (url, ns, onLoadCallback, name) {
            this.url = url;
            // url of the module
            this.ns = ns;
            // source obj/ns obj to bind 'define' method
            this.onLoadCallback = onLoadCallback;
            this.name = name;
            // dependency name
            this.load();
        };
        // TODO: add cross-browser support
        ScriptLoader.prototype.load = function () {
            var doc = document, head = doc.head || doc.getElementsByTagName('head')[0], script = doc.createElement('script'), that = this;
            script.type = 'text/javascript';
            script.src = this.url;
            script.onerror = this.fail;
            Modulerjs.bindDefine(this.ns);
            if (script.readyState) {
                script.onreadystatechange = function () {
                    if (script.readyState == 'loaded' || script.readyState == 'complete') {
                        script.id = 'loaded';
                        script.onreadystatechange = null;
                        that.onLoadCallback(that.name);
                    }
                };
            } else {
                script.onload = function () {
                    that.onLoadCallback(that.name);
                };
            }
            head.appendChild(script);
        };
        ScriptLoader.prototype.fail = function () {
            throw new Error('script load error url: ' + this.src);
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
                // simple module name without deep namespace
                moduleName = pathManager.moduleName(dep);
                this.data[moduleName] = null;
                aModule = resolver.resolve(this.source.modules, pathManager.fullModuleName(dep), { action: 'get' });
                // give warning if the resolved module is empty
                if (typeof aModule === 'undefined') {
                    // load module remotely
                    new SL(pathManager.path(dep), this.source, function (name) {
                        /* callback for some script loader */
                        that.register(name);
                    }, dep);
                } else {
                    this.register(dep);
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
        DependencyManager.prototype.register = function repeat(dep) {
            var aModule = resolver.resolve(this.source.modules, pathManager.fullModuleName(dep), { action: 'get' }), that = this;
            if (!aModule) {
                // if the module at this point is "undefined" that means the loaded module has dependencies of other modules
                // so register a recursive call to check the availablity of it's dependencies until it become available
                // then to update
                setTimeout(function () {
                    repeat.call(that, dep);
                }, 15);
            } else {
                // resolve one module, at this point we are sure, there is a value of "aModule"
                this.data[pathManager.moduleName(dep)] = aModule;
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
    resolver = function (DM, pm) {
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
            parse = pm.hasSubmodule(name);
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
        /**
         * Format return dependency data
         */
        function formatDeps(source) {
            var deps = [];
            for (var dep in source) {
                if (source.hasOwnProperty(dep)) {
                    deps.push(source[dep]);
                }
            }
            return deps;
        }
        /**
         * Format the object will be bind with "this" keywork within "define" and "require"
         *
         * @return object
         */
        function buildBind(source) {
            return {
                constant: source.constant,
                config: source.config,
                util: source.util
            };
        }
        function define(source, name, fn, deps) {
            // use a new dependencyManager to resolver the dependencies
            var dm = new DM(source, deps);
            // define a ready callback with "registerReadyCb" function provided by DependencyManager object
            dm.ready = dm.registerReadyCb(function (data) {
                var deps = formatDeps(data);
                exports(source.modules, name, fn.apply(buildBind(source), deps));
            });
            // resolve the dependency
            dm.resolve();
        }
        function require(source, deps, fn, ready) {
            // use a new dependencyManager to resolver the dependencies
            var dm = new DM(source, deps);
            // define a ready callback with "registerReadyCb" function provided by DependencyManager object
            dm.ready = dm.registerReadyCb(function (data) {
                var deps = formatDeps(data), bind = buildBind(source), rst = fn.apply(bind, deps);
                if (ready) {
                    // call ready callback, if there is one
                    ready.call(bind, rst);
                }
            });
            // resolve the dependency
            dm.resolve();
        }
        // api
        return {
            resolve: resolve,
            define: define,
            require: require,
            exports: exports
        };
    }(dependencyManager, pathManager);
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
                register: function (name, fn, base) {
                    resolver.exports(this.modules, name, fn.call(base, this.modules));
                }
            };
        return foundation;
    }();
    Modulerjs = function (Constant) {
        
        var bindDefineModule = null;
        /**
         * Delegate to resolver.define
         * This function is for some valiations
         */
        var define = function (name, fn, deps) {
            deps = deps || [];
            if (!name) {
                throw new Error('Module name is required when defining a module.');
            }
            if (!util.isArray(deps)) {
                throw new Error('Dependencies must be supplied as an array.');
            }
            // delegate define method to resolver's define
            resolver.define(this, name, fn, deps);
        };
        /**
         * Delegate to resolver.require
         * This function is for some validations
         */
        var require = function (deps, fn, ready, options) {
            if (!util.isArray(deps)) {
                throw new Error('Dependencies must be supplied as an array.');
            }
            options = options || {};
            // delegate require moethod to resolver's require method
            return resolver.require(this, deps, fn, ready, options);
        };
        /**
         * Wrap around the obj to provide Modulers' methods, define, require etc.
         * delegate the Modulerjs' create method
         *
         * @param object ns Namespace/object to attach methods
         *
         * @return object ns
         */
        var moduleManager = function (ns) {
            // private module container
            var modules = {};
            // augument default "modules" object with foundation's methods
            util.mixin(modules, foundation.modules);
            // TODO
            var config = {};
            var setup = function (fn) {
                fn(config);
            };
            // grab instance of constant service
            var constant = function () {
                    var constant = new Constant();
                    return {
                        get: constant.get,
                        set: constant.set
                    };
                }();
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
            ns.define = function (name, fn, deps) {
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
            ns.require = function (deps, fn, ready, options) {
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
                getModules: function () {
                    return modules;
                },
                showFoundation: function () {
                    return foundation;
                }
            };
            ns.setup = setup;
            return ns;
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
                var envelope = { util: util };
                foundation.register(name, fn, envelope);
            },
            bindDefine: function (target) {
                bindDefineModule = target;
            },
            define: function (name, fn, deps) {
                if (bindDefineModule === null) {
                    console.warn('Bind Define module is not set.');
                }
                return define.call(bindDefineModule, name, fn, deps);
            }
        };
    }(constant);
}());
window.Modulerjs = Modulerjs;
}());