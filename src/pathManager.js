define(['util'], function(util) {

    var MODULE_NAME_REGEX = /(\S+?)\.(\S+)/;
    var config = {
        baseUrl: 'http://localhost:8888/js/modules/'
    };

    return {
        config: function(options) {
            util.mixin(config, options, false, true);
        },
        path: function(name) {
            var url = config.baseUrl + name.replace('.', '/') + '.js';
            return url;
        },

        /**
         * Get the module name, if namespace only take the last one
         *
         * @return string
         */
        moduleName: function(name) {

            var submodules = this.hasSubmodule;

            if (submodules) {
                return name.split('.').pop();
            }

            return name;
        },
        hasSubmodule: function(name) {
            return MODULE_NAME_REGEX.exec(name);
        },
        fullModuleName: function(name) {
            return name;
        }
    };
});
