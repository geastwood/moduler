define(function() {

    var hasOwn = Object.prototype.hasOwnProperty;
    var ostring = Object.prototype.toString;
    var nativeForEach = Array.prototype.forEach;

    function hasProp(obj, prop) {
        hasOwn.call(obj, prop);
    }

    function isArray(obj) {
        return ostring.call(obj) === '[object Array]';
    }

    function isFunction(fn) {
        return ostring.call(fn) === '[object Function]';
    }

    function each(obj, fn, context) {

        /* jshint eqnull:true */
        if (obj == null) {
            return obj;
        }

        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(fn, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, length = obj.length; i < length; i++) {
                fn.call(context, obj[i], i, obj);
            }
        } else {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    fn.call(context, obj[key], key, obj);
                }
            }
        }

        return obj;
    }

    function mixin(target, source, force, deepStringMixin) {
        if (source) {
            each(source, function (value, prop) {
                if (force || !hasProp(target, prop)) {
                    if (deepStringMixin && typeof value === 'object' && value &&
                        !isArray(value) && !isFunction(value) &&
                        !(value instanceof RegExp)) {

                        if (!target[prop]) {
                            target[prop] = {};
                        }
                        mixin(target[prop], value, force, deepStringMixin);
                    } else {
                        target[prop] = value;
                    }
                }
            });
        }
        return target;
    }

    /**
     * Inherit constructors
     *
     * @param function Child Child constructor function, if null specified, constructor will be empty fn
     * @param function Parent Parent construtor to inherit from
     *
     * @return function Child constructor
     */
    function inherit(Child, Parent) {

        if (!Parent || typeof Parent !== 'function') {
            throw new Error('Second parameter expects to be a constructor function');
        }

        if (Child === null) {
            Child = function() {};
        }

        var F = function() {};
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.prototype.constructor = Child;

        return Child;
    }

    return {
        isArray: isArray,
        each: each,
        inherit: inherit,
        mixin: mixin
    };
});
