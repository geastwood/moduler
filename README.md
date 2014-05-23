moduler [![Build Status](https://travis-ci.org/geastwood/tokenlist.svg?branch=master)](https://travis-ci.org/geastwood/tokenlist)
=======

A small module manager.

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
        };
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
## augment an existing object with require
```javascript
// a simple object
var base = {
    name: 'base object',
    fn: function() {
        return this.name;
    }
};

var foo = {};
moduler.create(foo);
//define a module
foo.define('bar', function() {
    return {
        name: 'bar',
        fn: function() {
            return this.name + ' is another object';
        }
    };
});

// pass the base object
foo.require(['bar'], {base: base});
// now base object is augmented with bar object, similar to mixin function
base.bar.fn(); // log 'bar is another object'
```

## alias
Use '**as**' to alias a module when using '**require**'
```javascript
// providerd that a 'Person' constructor module is already defined
// now alias 'Person' as 'P'
var dependency = foo.require(['Person as P']);
'P' in dependency; // log true
'Person' in dependency; // log false
```
