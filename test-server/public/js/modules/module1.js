moduler.define('module1', function() {
    return function(msg) {
        console.log(msg);
    };
});
console.log('loading module1 from server');
