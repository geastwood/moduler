Modulerjs.define('util.isArray', function() {
    return function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };
});
