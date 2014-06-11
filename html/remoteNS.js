var foo = {};
Modulerjs.create(foo);
var start = (new Date()).valueOf();
var eclipse;
foo.require(['util.isNumber'], function(isNumber) {
    eclipse = (new Date()).valueOf() - start;
    console.log('time costed', eclipse, 'milliseconds');
    return isNumber;
}, function(isNumber) {
    console.log('1 is number?', isNumber(1));
    console.log('string is number?', isNumber('string'));
    console.log(foo.debug.getModules());
});
foo.require(['math.max'], function(max) {
    console.log(max(1, 3, 4, 5, 6));
});
