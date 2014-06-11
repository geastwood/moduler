define(function() {

    var PathManager = function(options) {
        this.configure(options);
    };

    PathManager.prototype.configure = function(options) {
        this.config = options.path;
    };
    PathManager.prototype.path = function(name) {
        var url = this.config.baseUrl + name.replace(/\./g, '/') + '.js';
        return url;
    };

    /**
     * Get the module name, if namespace only take the last one
     *
     * @return string
     */
    PathManager.prototype.moduleName = function(name) {

        var MODULE_NAME_REGEX = /(\S+?)\.(\S+)/;

        if (MODULE_NAME_REGEX.exec(name)) {
            return name.split('.').pop();
        }

        return name;
    };

    PathManager.prototype.fullModuleName = function(name) {
        return name;
    };

    return PathManager;
});
