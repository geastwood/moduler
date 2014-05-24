define(function() {

    var Constant = function() {};

    Constant.prototype.get = function(name) {
        return this[name];
    };

    Constant.prototype.set = function(name, value) {

        var status = false;

        if (typeof this[name] === 'undefined') {
            this[name] = value;
            status = true;
        } else {
            console.warn('try to set again the constant: ' + this[name]);
        }

        return status;
    };

    return Constant;
});
