define ['pathManager'], (pathManager) ->
    class ScriptLoader
        # @ns source obj/ns object to bind 'define' method
        # @name dependency name
        constructor: (@url, @ns, @onLoadCallback, @name) ->
            @load()
        load: ->
            doc = document
            head = if doc.head then doc.head else doc.getElementsByTagName('head')[0]
            script = doc.createElement('script')
            script.type = 'text/javascript'
            script.src = @url
            script.onerror = @fail
            Modulerjs.bindDefine(@ns)

            if (script.readyState)
                script.onreadystatechange = =>
                    if script.readyState == 'loaded' or script.readyState == 'complete'
                        script.onreadystatechange = null
                        @onLoadCallback(@name)
            else
                script.onload = =>
                    @onLoadCallback(@name)

            head.appendChild(script)

        fail: ->
            throw new Error("script load error url: #{@src}");
