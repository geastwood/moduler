define(function() {
  var PathManager;
  return PathManager = (function() {
    function PathManager(options) {
      this.configure(options);
    }

    PathManager.prototype.configure = function(options) {
      return this.config = options.path;
    };

    PathManager.prototype.path = function(name) {
      var url;
      return url = this.config.baseUrl + name.replace(/\./g, '/') + '.js';
    };

    PathManager.prototype.moduleName = function(name) {
      var MODULE_NAME_REGEX;
      MODULE_NAME_REGEX = /(\S+?)\.(\S+)/;
      if (MODULE_NAME_REGEX.exec(name)) {
        return name.split('.').pop();
      }
      return name;
    };

    PathManager.prototype.fullModuleName = function(name) {
      return name;
    };

    return PathManager;

  })();
});
