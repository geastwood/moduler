moduler.extend(function(foundation) {
    var pluck = function(value) {
        return function(data) {
            return data && data[value];
        };
    };
    foundation.util = {
        pluck: pluck
    };
});
