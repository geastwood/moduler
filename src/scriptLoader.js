define(function() {
    var ScriptLoader = function(url, ns, fn, name) {
        this.url = url;
        this.ns = ns; /* source obj/ns obj to bind 'define' method */
        this.fn = fn;
        this.name = name;
        this.load();
    };
    ScriptLoader.prototype.load = function() {
        var script = document.createElement('script');
        script.src = this.url;
        moduler.bindDefine(this.ns);
        var that = this;
        script.onload = function() {
            that.fn(that.name);
        };
        document.head.appendChild(script);
    };
    return ScriptLoader;
});
