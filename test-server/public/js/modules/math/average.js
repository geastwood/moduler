Modulerjs.define('math.average', function(isNumber) {
    return function() {
        var sum = 0, count = 0;
        for (var i = 0, len = arguments.length; i < len; i++) {
            if (isNumber(arguments[i])) {
                sum += arguments[i];
                count++;
            }
        }
        return count === 0 ? 0 : (sum/count);
    };
}, ['util.isNumber']);
