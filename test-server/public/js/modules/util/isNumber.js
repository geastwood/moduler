Modulerjs.define('util.isNumber', function() {
    return function(v) {
        return typeof v === 'number' && v === v++;
    };
});
