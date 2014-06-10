define(function() {

    var ScriptLoader = function(url, ns, onLoadCallback, name) {
        this.url = url; // url of the module
        this.ns = ns; // source obj/ns obj to bind 'define' method
        this.onLoadCallback = onLoadCallback;
        this.name = name; // dependency name
        this.load();
    };

    // TODO: add cross-browser support
    ScriptLoader.prototype.load = function() {

        var doc = document,
            head = doc.head || doc.getElementsByTagName('head')[0],
            script = doc.createElement('script'),
            that = this;

        script.type = 'text/javascript';
        script.src = this.url;
        script.onerror = this.fail;
        Modulerjs.bindDefine(this.ns);

        if (script.readyState) {
            script.onreadystatechange = function() {
                if (script.readyState == 'loaded' || script.readyState == 'complete') {
                    script.id = 'loaded';
                    script.onreadystatechange = null;
                    that.onLoadCallback(that.name);
                }
            };
        } else {
            script.onload = function() {
                that.onLoadCallback(that.name);
            };
        }

        head.appendChild(script);
    };

    ScriptLoader.prototype.fail = function() {
        throw new Error('script load error url: ' + this.src);
    };

    return ScriptLoader;
});
