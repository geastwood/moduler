define(function() {
    var ScriptLoader = function(url, ns, fn) {
        this.url = url;
        this.ns = ns;
        this.fn = fn;
        this.load();
    };
    ScriptLoader.prototype.load = function() {
        var script = document.createElement('script');
        script.src = this.url;
        moduler.bindDefine(this.ns);
        var that = this;
        script.onload = function() {
            that.fn();
        };
        document.head.appendChild(script);
    };
    return ScriptLoader;
});
