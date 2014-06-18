define ['resolver'], (resolver) ->
    foundation =
        modules: {}
        register: (name, fn, base) ->
            resolver.exports(@modules, name, fn.call(base, @modules))
            undefined
    foundation
