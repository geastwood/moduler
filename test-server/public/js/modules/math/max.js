Modulerjs.define('max', function() {
    return function() {
        return Math.max.apply(null, arguments);
    };
});
