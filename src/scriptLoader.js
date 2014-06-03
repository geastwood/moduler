define(function() {
    var scriptLoader = function(url, ns, fn) {
        this.url = url;
        this.ns = ns;
        this.fn = fn;
    };
    scriptLoader.prototype.load = function() {
        var script = document.createElement('script');
        script.src = url;
        moduler.bindDefine(ns);
        document.head.appendChild(script);
    };
    return scriptLoader;
});
