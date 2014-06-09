Modulerjs
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
When require modules, Modulerjs will first try to resolve dependencies locally, if not found, the dependencies will be loaded via the path specified.

The second parameter is the `dependency callback` which will be invoked when the all dependencies have been resolved.

There is a third optional parameter, a `ready callback`. It will be called after the `dependency callback` and receive the `return value` of `dependency callback` as input parameter.
```javascript
var bar;
foo.require(['bar'], function(bar) {
    bar = bar;
});

// dependency will an object that containts 'bar' object
'bar.name' // log 'bar'
```

## ready callback in require
A typical use of the `ready` callback is to use `require` to load a plugin and invoke the plugin's `init` method.
```javascript
foo.require(
    ['pluginDep1', 'pluginDep1'],
    function(dep1, dep2){ // dependency callback
        // define plugin with dep1 and dep2
        return plugin;
    },
    function(plugin) { // ready callback
        plugin.init();
    }
);
```
