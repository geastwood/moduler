define(['resolver', 'scriptLoader', 'pathManager'], function(resolver, SL, PathManager) {
  var DependencyManager, register;
  register = function(dep) {
    var aModule;
    aModule = resolver.getModule(this.source.modules, this.pathManager.fullModuleName(dep));
    if (!aModule) {
      return setTimeout((function(_this) {
        return function() {
          return register.call(_this, dep);
        };
      })(this), 15);
    } else {
      this.data[this.pathManager.moduleName(dep)] = aModule;
      return this.update();
    }
  };
  return DependencyManager = (function() {
    function DependencyManager(source, deps, options) {
      this.source = source;
      this.deps = deps;
      this.count = 0;
      this.data = {};
      this.pathManager = new PathManager(options);
    }

    DependencyManager.prototype.resolve = function() {
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
          _results.push(new SL(this.pathManager.path(dep), this.source, (function(_this) {
            return function(name) {
              return _this.register(name);
            };
          })(this), dep));
        } else {
          _results.push(this.register(dep));
        }
      }
      return _results;
    };

    DependencyManager.prototype.register = register;

    DependencyManager.prototype.ready = function() {
      throw new Error('This method need to be implemented. Cannot be called from here');
    };

    DependencyManager.prototype.registerReadyCb = function(fn) {
      return (function(_this) {
        return function() {
          return fn(_this.data);
        };
      })(this);
    };

    DependencyManager.prototype.update = function() {
      this.count += 1;
      if (this.count === this.deps.length) {
        return this.ready();
      }
    };

    return DependencyManager;

  })();
});
