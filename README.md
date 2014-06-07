moduler
=======

A module manager.

## define a module
```javascript
var foo = {};
moduler.create(foo); // setup the foo object to be able to define/require module

// define a bar module with a simple object
foo.define('bar', function() {
    return {
        name: 'bar',
        hi: function() {
            return 'This object\'s name is ' + this.name;
        }
    };
});
```
## define a module with multiple dependencies
It's possible to define a modue with previously defined module.
```javascript
// provided that there are two modules
// module1 and module2 are already defined with foo.define
foo.define('bar', function(module1, module2) {
    return {
        name: 'bar',
        description: 'this module has dependencies "module1" and "module2"'
    };
}, ['module1', 'module2']);
```
## define a module that returns a constructor
```javascript
var foo = {
    bar: {}
};

foo.define('Person', function() {
    var Person = function() {};
    Person.prototype.name = 'John Doe';
    Person.prototype.introduce = function() {
        return 'My name is ' + this.name;
    };
    return Person;
});

var dependency = foo.require(['Person']);
var me = new dependency.Person();
me.name = 'Fei';
me.introduce(); // log 'My name is Fei';
```
## require (fetch) modules
require a module
```javascript
var dependency = foo.require(['bar']);

// dependency will an object that containts 'bar' object
'bar' in dependency; // log true
```
