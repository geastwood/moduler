define(function() {
    return {
        isArray: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }
    };
});
