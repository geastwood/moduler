moduler.define('module1', function() {
    return function(msg) {
        console.log(msg);
    };
}, ['module0', 'module4', 'module5']);
console.log('loading module1 from server');
