Modulerjs.define('module4', function(m0) {
    return {
        name: 'module4 requires: ' + m0.name
    };
}, ['module0']);
console.log('loading module4 from server');
