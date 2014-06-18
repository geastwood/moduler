define(function() {
  var Constant;
  Constant = (function() {
    function Constant() {}

    Constant.prototype.get = function(name) {
      return this[name];
    };

    Constant.prototype.set = function(name, value) {
      var status;
      status = false;
      if (this[name] == null) {
        this[name] = value;
        return true;
      } else {
        console.warn("Try to set again the constant: " + this[name]);
      }
      return status;
    };

    return Constant;

  })();
  return Constant;
});
