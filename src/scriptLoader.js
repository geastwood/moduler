define(function() {

    var ScriptLoader = function(url, ns, onLoadCallback, name) {
        this.url = url; /* url of the module */
        this.ns = ns; /* source obj/ns obj to bind 'define' method */
        this.onLoadCallback = onLoadCallback;
        this.name = name;
        this.load();
    };

    // TODO: add cross-browser support
    ScriptLoader.prototype.load = function() {
        var script = document.createElement('script');
        var that = this;
        script.src = this.url;
        moduler.bindDefine(this.ns);
        script.onload = function() {
            that.onLoadCallback(that.name);
        };
        document.head.appendChild(script);
    };

    return ScriptLoader;
});
