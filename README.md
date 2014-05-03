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
});
```
## define a module with multiple dependencies
It's possible to define a modue with previously defined module.
```javascript
// suppose there are two modules
// module1 and module2 are already defined with foo.define
// TODO
```
## require (fetch) modules
//TODO
## alias
//TODO

