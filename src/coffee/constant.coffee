define ->
    class Constant
        get: (name) ->
            @[name]
        set: (name, value) ->
            status = false
            unless @[name]?
                @[name] = value
                return true
            else
                console.warn("Try to set again the constant: #{@[name]}")
            status
    Constant
