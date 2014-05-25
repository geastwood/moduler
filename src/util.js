define(function() {

    var isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    return {
        isArray: isArray
    };
});
