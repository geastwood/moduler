Modulerjs.define('math.min', function() {
    return function() {
        return Math.min.apply(null, arguments);
    };
});
