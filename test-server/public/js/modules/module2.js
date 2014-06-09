Modulerjs.define('module2', function(m1, m4) {
    return {
        name: 'module2 requires: ' + m4.name
    };
}, ['module1', 'module4']);
console.log('loading module2 from server');
