moduler.define('Person', function(greet) {

    var Person = function() {};

    Person.prototype.breath = 'air';
    Person.prototype.speak = function(thing) {
        return greet(thing);
    };

    return Person;

}, ['greet']);
