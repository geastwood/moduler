;(function() {
var pathManager, scriptLoader, dependencyManager, resolver, util, constant, foundation, Modulerjs;
(function () {
    pathManager = function () {
        var PathManager;
        return PathManager = function () {
            function PathManager(options) {
                this.configure(options);
            }
            PathManager.prototype.configure = function (options) {
                return this.config = options.path;
            };
            PathManager.prototype.path = function (name) {
                var url;
                return url = this.config.baseUrl + name.replace(/\./g, '/') + '.js';
            };
            PathManager.prototype.moduleName = function (name) {
                var MODULE_NAME_REGEX;
                MODULE_NAME_REGEX = /(\S+?)\.(\S+)/;
                if (MODULE_NAME_REGEX.exec(name)) {
                    return name.split('.').pop();
                }
                return name;
            };
            PathManager.prototype.fullModuleName = function (name) {
                return name;
            };
            return PathManager;
        }();
    }();
    scriptLoader = function () {
        var ScriptLoader;
        return ScriptLoader = function () {
            function ScriptLoader(url, ns, onLoadCallback, name) {
                this.url = url;
                this.ns = ns;
                this.onLoadCallback = onLoadCallback;
                this.name = name;
                this.load();
            }
            ScriptLoader.prototype.load = function () {
                var doc, head, script;
                doc = document;
                head = doc.head ? doc.head : doc.getElementsByTagName('head')[0];
                script = doc.createElement('script');
                script.type = 'text/javascript';
                script.src = this.url;
                script.onerror = this.fail;
                Modulerjs.bindDefine(this.ns);
                if (script.readyState) {
                    script.onreadystatechange = function (_this) {
                        return function () {
                            if (script.readyState === 'loaded' || script.readyState === 'complete') {
                                script.onreadystatechange = null;
                                return _this.onLoadCallback(_this.name);
                            }
                        };
                    }(this);
                } else {
                    script.onload = function (_this) {
                        return function () {
                            return _this.onLoadCallback(_this.name);
                        };
                    }(this);
                }
                return head.appendChild(script);
            };
            ScriptLoader.prototype.fail = function () {
                throw new Error('script load error url: ' + this.src);
            };
            return ScriptLoader;
        }();
    }();
    dependencyManager = function (SL, PathManager) {
        var DependencyManager, register;
        register = function (dep) {
            var aModule;
            aModule = resolver.getModule(this.source.modules, this.pathManager.fullModuleName(dep));
            if (!aModule) {
                return setTimeout(function (_this) {
                    return function () {
                        return register.call(_this, dep);
                    };
                }(this), 15);
            } else {
                this.data[this.pathManager.moduleName(dep)] = aModule;
                return this.update();
            }
        };
        return DependencyManager = function () {
            function DependencyManager(source, deps, options) {
                this.source = source;
                this.deps = deps;
                this.count = 0;
                this.data = {};
                this.pathManager = new PathManager(options);
            }
            DependencyManager.prototype.resolve = function () {
                var aModule, dep, i, len, moduleName, _i, _len, _ref, _results;
                len = this.deps.length;
                if (len === 0) {
                    this.ready();
                }
                _ref = this.deps;
                _results = [];
                for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
                    dep = _ref[i];
                    moduleName = this.pathManager.moduleName(dep);
                    this.data[moduleName] = null;
                    aModule = resolver.getModule(this.source.modules, this.pathManager.fullModuleName(dep));
                    if (aModule == null) {
                        _results.push(new SL(this.pathManager.path(dep), this.source, function (_this) {
                            return function (name) {
                                return _this.register(name);
                            };
                        }(this), dep));
                    } else {
                        _results.push(this.register(dep));
                    }
                }
                return _results;
            };
            DependencyManager.prototype.register = register;
            DependencyManager.prototype.ready = function () {
                throw new Error('This method need to be implemented. Cannot be called from here');
            };
            DependencyManager.prototype.registerReadyCb = function (fn) {
                return function (_this) {
                    return function () {
                        return fn(_this.data);
                    };
                }(this);
            };
            DependencyManager.prototype.update = function () {
                this.count += 1;
                if (this.count === this.deps.length) {
                    return this.ready();
                }
            };
            return DependencyManager;
        }();
    }(scriptLoader, pathManager);
    var __hasProp = {}.hasOwnProperty;
    resolver = function (DM) {
        var buildBind, define, exports, formatDeps, getModule, require, resolve;
        resolve = function (target, name, options) {
            var MODULE_NAME_REGEX, hasSubmodule, parse;
            MODULE_NAME_REGEX = /(\S+?)\.(\S+)/;
            options = options || { action: 'get' };
            if (!name) {
                throw new Error('Module name must be specified');
            }
            parse = MODULE_NAME_REGEX.exec(name);
            hasSubmodule = parse !== null;
            if (hasSubmodule) {
                target[parse[1]] = target[parse[1]] || {};
                resolve(target[parse[1]], parse[2], options);
            }
            if (options.action === 'get') {
                return target[name];
            } else if (options.action === 'set') {
                if (typeof options.obj === void 0) {
                    throw new Error('Set action with an empty object');
                }
                target[name] = options.obj;
                return true;
            } else {
                throw new Error('Unsupported action.');
            }
        };
        exports = function (target, name, obj) {
            return resolve(target, name, {
                action: 'set',
                obj: obj
            });
        };
        getModule = function (target, name) {
            return resolve(target, name, { action: 'get' });
        };
        formatDeps = function (source) {
            var dep, deps, key;
            deps = [];
            for (key in source) {
                if (!__hasProp.call(source, key))
                    continue;
                dep = source[key];
                deps.push(dep);
            }
            return deps;
        };
        buildBind = function (source) {
            return {
                constant: source.constant,
                config: source.config,
                util: source.util
            };
        };
        define = function (source, name, fn, deps) {
            var dm;
            dm = new DM(source, deps, source.config);
            dm.ready = dm.registerReadyCb(function (data) {
                deps = formatDeps(data);
                return exports(source.modules, name, fn.apply(buildBind(source), deps));
            });
            return dm.resolve();
        };
        require = function (source, deps, fn, ready) {
            var dm;
            dm = new DM(source, deps, source.config);
            dm.ready = dm.registerReadyCb(function (data) {
                var bind, rst;
                deps = formatDeps(data);
                bind = buildBind(source);
                rst = fn.apply(bind, deps);
                if (ready) {
                    return typeof ready.call === 'function' ? ready.call(bind, rst) : void 0;
                }
            });
            return dm.resolve();
        };
        return {
            resolve: resolve,
            define: define,
            require: require,
            getModule: getModule,
            exports: exports
        };
    }(dependencyManager);
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
    constant = function () {
        var Constant;
        Constant = function () {
            function Constant() {
            }
            Constant.prototype.get = function (name) {
                return this[name];
            };
            Constant.prototype.set = function (name, value) {
                var status;
                status = false;
                if (this[name] == null) {
                    this[name] = value;
                    return true;
                } else {
                    console.warn('Try to set again the constant: ' + this[name]);
                }
                return status;
            };
            return Constant;
        }();
        return Constant;
    }();
    foundation = function () {
        var foundation;
        foundation = {
            modules: {},
            register: function (name, fn, base) {
                resolver.exports(this.modules, name, fn.call(base, this.modules));
                return void 0;
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
        var require = function (deps, fn, ready) {
            if (!util.isArray(deps)) {
                throw new Error('Dependencies must be supplied as an array.');
            }
            // delegate require moethod to resolver's require method
            return resolver.require(this, deps, fn, ready);
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
            var config = { path: { baseUrl: 'http://localhost:8888/js/modules/' } };
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
            ns.require = function (deps, fn, ready) {
                return require.call(envelope, deps, fn, ready);
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