define ->
    class PathManager
        constructor: (options) ->
            @configure(options)
        configure: (options) ->
            @config = options.path
        path: (name) ->
            url = @config.baseUrl + name.replace(/\./g, '/') + '.js'

        # Get the module name, if namespace only take the last one
        # @return string
        moduleName: (name) ->
            MODULE_NAME_REGEX = /(\S+?)\.(\S+)/
            return name.split('.').pop() if (MODULE_NAME_REGEX.exec(name))
            name
        fullModuleName: (name) ->
            name
