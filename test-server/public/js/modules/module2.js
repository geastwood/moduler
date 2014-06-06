moduler.define('module2', function(m1) {
    return {
        name: 'module2'
    };
}, ['module1']);
console.log('loading module2 from server');
