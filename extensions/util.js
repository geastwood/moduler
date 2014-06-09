Modulerjs.extend('util', function(modules) {
    var pluck = function(value) {
        return function(data) {
            return data && data[value];
        };
    };
    return {
        pluck: pluck
    };
});
