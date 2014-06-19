define ['dependencyManager'], (DM) ->

    ##
    # Resolve namespace with "get" or "set" methods
    ##
    resolve = (target, name, options) ->

        MODULE_NAME_REGEX = /(\S+?)\.(\S+)/
        options = options || {action: 'get'}

        throw new Error ('Module name must be specified') unless name

        parse = MODULE_NAME_REGEX.exec(name)
        hasSubmodule = parse isnt null

        if hasSubmodule
            target[parse[1]] = target[parse[1]] || {}
            # recursively solve the namespace
            resolve(target[parse[1]], parse[2], options)

        if options.action is 'get'
            return target[name]
        else if options.action is 'set'
            throw new Error('Set action with an empty object') if typeof options.obj is undefined

            target[name] = options.obj
            return true
        else
            throw new Error('Unsupported action.')

    # exports function, deledate to set action of the resolve function
    exports = (target, name, obj) ->
        resolve(target, name, {
            action: 'set'
            obj: obj
        })

    # Get a module by name
    getModule = (target, name) ->
        resolve(target, name, {action: 'get'})

    # TODO refactoring
    # Format the dependency data
    formatDeps = (source) ->
        deps = []
        deps.push dep for own key, dep of source
        deps

    # Format the object will be bind with "this" keyword within "define" and "require"
    buildBind = (source) ->
        return {
            constant: source.constant
            config: source.config
            util: source.util
        }

    # define
    define = (source, name, fn, deps) ->

        # use a new dependencyManager to resolve depdendency
        dm = new DM(source, deps, source.config)

        # define a ready callbac with "registerReadyCb" function provided by Dependency Manager
        dm.ready = dm.registerReadyCb (data) ->
            deps = formatDeps(data)
            exports(source.modules, name, fn.apply(buildBind(source), deps))

        # resolve the dependency
        dm.resolve()

    require = (source, deps, fn, ready) ->
        dm = new DM(source, deps, source.config)
        dm.ready = dm.registerReadyCb (data) ->
            deps = formatDeps(data)
            bind = buildBind(source)
            rst = fn.apply(bind, deps)

            # call the ready callback, if there is one
            ready.call?(bind, rst) if ready

        dm.resolve()

    # api
    return {
        resolve: resolve
        define: define
        require: require
        getModule: getModule # behave as a getter
        exports: exports # behave as a setter
    }
