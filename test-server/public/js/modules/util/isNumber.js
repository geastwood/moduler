Modulerjs.define('isNumber', function() {
    return function(v) {
        return typeof v === 'number' && v === v++;
    };
}, ['isArray']);
