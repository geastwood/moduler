var __hasProp = {}.hasOwnProperty;

define(['dependencyManager'], function(DM) {
  var buildBind, define, exports, formatDeps, getModule, require, resolve;
  resolve = function(target, name, options) {
    var MODULE_NAME_REGEX, hasSubmodule, parse;
    MODULE_NAME_REGEX = /(\S+?)\.(\S+)/;
    options = options || {
      action: 'get'
    };
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
  exports = function(target, name, obj) {
    return resolve(target, name, {
      action: 'set',
      obj: obj
    });
  };
  getModule = function(target, name) {
    return resolve(target, name, {
      action: 'get'
    });
  };
  formatDeps = function(source) {
    var dep, deps, key;
    deps = [];
    for (key in source) {
      if (!__hasProp.call(source, key)) continue;
      dep = source[key];
      deps.push(dep);
    }
    return deps;
  };
  buildBind = function(source) {
    return {
      constant: source.constant,
      config: source.config,
      util: source.util
    };
  };
  define = function(source, name, fn, deps) {
    var dm;
    dm = new DM(source, deps, source.config);
    dm.ready = dm.registerReadyCb(function(data) {
      deps = formatDeps(data);
      return exports(source.modules, name, fn.apply(buildBind(source), deps));
    });
    return dm.resolve();
  };
  require = function(source, deps, fn, ready) {
    var dm;
    dm = new DM(source, deps, source.config);
    dm.ready = dm.registerReadyCb(function(data) {
      var bind, rst;
      deps = formatDeps(data);
      bind = buildBind(source);
      rst = fn.apply(bind, deps);
      if (ready) {
        return typeof ready.call === "function" ? ready.call(bind, rst) : void 0;
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
});
