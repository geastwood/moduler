define(function() {

    /**
     * Constant constructor function
     *
     * @return object
     */
    var Constant = function() {};

    /**
     * getter
     *
     * @return mixed
     */
    Constant.prototype.get = function(name) {
        return this[name];
    };

    /**
     * Setter
     *
     * @return boolean
     */
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
