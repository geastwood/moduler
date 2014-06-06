var foo = {};
moduler.create(foo);
var start = (new Date()).valueOf();
var eclipse;
foo.require(['module2'], null, function(m2) {
    eclipse = (new Date()).valueOf() - start;
    console.log('constent of m2', m2 && m2.name||'--------process failed--------');
    console.log('time costed', eclipse, 'milliseconds');
});
