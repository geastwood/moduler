Modulerjs.define(function() {
    return function(v) {
        return typeof v === 'number' && v === v++;
    };
});
