define(['resolver'], function(resolver) {
  var foundation;
  foundation = {
    modules: {},
    register: function(name, fn, base) {
      resolver.exports(this.modules, name, fn.call(base, this.modules));
      return void 0;
    }
  };
  return foundation;
});
