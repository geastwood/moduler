var moduler = (function() {

    var resolver = (function() {

        'use strict';

        var MODULE_NAME_REGEX = /(\S+?)\.(\S+)/;

        return function resolve(target, name) {

            var action = 'get', obj, parse, hasSubmodule, toSet = arguments.length === 3;

            if (!name) {
                throw new Error('module name must be specified.');
            }

            if (toSet) {
                action = 'set';
                obj = arguments[2];
            }

            parse = MODULE_NAME_REGEX.exec(name);
            hasSubmodule = parse !== null;

            if (hasSubmodule) {

                target[parse[1]] = target[parse[1]] || {};

                if (toSet) {
                    return resolve(target[parse[1]], parse[2], obj);
                } else {
                    return resolve(target[parse[1]], parse[2]);
                }
            }

            if (action === 'get') {
                return target[name];
            } else if (action === 'set') {

                if (typeof obj === undefined) {
                    throw new Error('Set action with an empty object.');
                }
                target[name] = obj;
            } else {
                throw new Error('Failed to resolve.');
            }

        };

    }());

    return {
        create: function(ns) {

        },
        exports: function(target, name, obj) {
            return resolver(target, name, obj);
        }
    };
}());
