Modulerjs.define('misc.camelCase', function() {
    return function(str) {
        return str.replace(/-(\w)/, function(all, match) {
            return match.toUpperCase();
        });
    };
});
