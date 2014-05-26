define(function() {

    var nativeForEach = Array.prototype.forEach;

    function each(obj, iterator, context) {

        if (obj == null) {
            return obj;
        }

        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, length = obj.length; i < length; i++) {
                iterator.call(context, obj[i], i, obj);
            }
        } else {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    iterator.call(context, obj[key], key, obj);
                }
            }
        }

        return obj;
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

    function extend(source, target) {
        var key;

        for (key in source) {

            if (source.hasOwnProperty(key)) {
                target[key] = source[key];
            }
        }
    }

    function isArray(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    }

    return {
        isArray: isArray,
        each: each,
        inherit: inherit,
        extend: extend
    };
});
