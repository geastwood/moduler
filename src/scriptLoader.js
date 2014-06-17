define(['pathManager'], function(pathManager) {
  var ScriptLoader;
  return ScriptLoader = (function() {
    function ScriptLoader(url, ns, onLoadCallback, name) {
      this.url = url;
      this.ns = ns;
      this.onLoadCallback = onLoadCallback;
      this.name = name;
      this.load();
    }

    ScriptLoader.prototype.load = function() {
      var doc, head, script;
      doc = document;
      head = doc.head ? doc.head : doc.getElementsByTagName('head')[0];
      script = doc.createElement('script');
      script.type = 'text/javascript';
      script.src = this.url;
      script.onerror = this.fail;
      Modulerjs.bindDefine(this.ns);
      if (script.readyState) {
        script.onreadystatechange = (function(_this) {
          return function() {
            if (script.readyState === 'loaded' || script.readyState === 'complete') {
              script.onreadystatechange = null;
              return _this.onLoadCallback(_this.name);
            }
          };
        })(this);
      } else {
        script.onload = (function(_this) {
          return function() {
            return _this.onLoadCallback(_this.name);
          };
        })(this);
      }
      return head.appendChild(script);
    };

    ScriptLoader.prototype.fail = function() {
      throw new Error("script load error url: " + this.src);
    };

    return ScriptLoader;

  })();
});
