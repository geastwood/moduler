define ['resolver', 'scriptLoader', 'pathManager'], (resolver, SL, PathManager) ->
    # to resolve recursion
    register = (dep) ->
        aModule = resolver.getModule(@source.modules, @pathManager.fullModuleName(dep))

        unless aModule
            setTimeout(=>  register.call(@, dep),
            15)
        else
            @data[@pathManager.moduleName(dep)] = aModule
            @update()

    class DependencyManager
        constructor: (source, deps, options) ->
            @source = source
            @deps = deps
            @count = 0
            @data = {}
            @pathManager = new PathManager(options)
        resolve: ->

            len = @deps.length
            @ready() if len is 0

            for dep, i in @deps
                moduleName = @pathManager.moduleName(dep)
                @data[moduleName] = null
                aModule = resolver.getModule(@source.modules, @pathManager.fullModuleName(dep))

                unless aModule?
                    new SL(@pathManager.path(dep),
                    @source,
                    (name) => @register(name),
                    dep)
                else
                    @register(dep)

        register: register
        ready: ->
            throw new Error('This method need to be implemented. Cannot be called from here')
        registerReadyCb: (fn) ->
           => fn(@data)
        update: ->
            @count += 1
            @ready() if @count is @deps.length

