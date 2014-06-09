Modulerjs.define('constantInDynamicScript', function() {
    return this;
});
console.log('this script is used for test "constant" object in script loading');
/**
 * A dynamically loaded script should be run under correct module and
 * when it runs, "this" keyword should be bind correctly.
 *
 * I.E. It should be
 *      * constant
 *      * util // many utilities methods
 *      * config
 */
