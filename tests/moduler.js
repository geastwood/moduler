var fakeGlobal;
beforeEach(function() {
    fakeGlobal = {name: 'fake global'};
});

describe('api', function() {
    it('should have static create', function() {
        expect(moduler.create).toBeDefined();
    });
    it('should have static export', function() {
        expect(moduler.exports).toBeDefined();
    });
    it('should have static extend', function() {
        expect(moduler.extend).toBeDefined();
    });
});
describe('static exports function', function() {

    var obj = {
        name: 'should work',
        ok: function() {
            return this.name;
        }
    };
    it('should work with simple object', function() {
        moduler.exports(fakeGlobal, 'some.deep.name.space.should.work', obj);
        expect(fakeGlobal.some.deep.name.space.should.work.ok()).toBe('should work');
    });
    it('export to exist object', function() {
        fakeGlobal.anotherObj = {name: 'another obj'};
        expect(fakeGlobal.anotherObj.name).toBe('another obj');

        moduler.exports(fakeGlobal.anotherObj, 'some.deep.name.space.should.work', obj);
        expect(fakeGlobal.anotherObj.some.deep.name.space.should.work.ok()).toBe('should work');

        moduler.exports(fakeGlobal, 'anotherObj.some.deep.name.space.should.work', obj);
        expect(fakeGlobal.anotherObj.some.deep.name.space.should.work.ok()).toBe('should work');
    });
});

describe('static create function', function() {

    var foo;

    beforeEach(function() {
        foo = {bar: {}};
        moduler.create(foo.bar);
    });

    describe('the namespace should have a "define" and "require" function', function() {
        it('should have define', function() {
            expect(foo.bar.define).toBeDefined();
        });
        it('should have require', function() {
            expect(foo.bar.require).toBeDefined();
        });
        it('should have setup', function() {
            expect(foo.bar.setup).toBeDefined();
        });
    });

});

describe('define and require', function() {

    var foo;

    beforeEach(function() {
        foo = {};
        moduler.create(foo);
        foo.define('bar', function() {
            return {
                name: 'bar',
                hi: function() {
                    return this.name + ' says i\'m bar';
                }
            };
        });
    });

    describe('work with simple object', function() {

        it('should work', function() {

            var dep = foo.require(['bar']);
            expect(dep.bar.name).toBe('bar');
            expect(dep.bar.hi()).toBe('bar says i\'m bar');

        });
    });

    describe('should work with constructor function', function() {

        it('should work', function() {

            foo.define('Person', function() {
                var Person = function() {};
                Person.prototype.name = 'John Doe';
                Person.prototype.occupation = 'unemployed';
                Person.prototype.introduce = function() {
                    return 'My name is ' + this.name + ', and I\'m currently ' + this.occupation + '.';
                };
                return Person;
            });

            var dep = foo.require(['Person as P']);
            var me = new dep.P();
            expect(me.name).toBe('John Doe');
            expect(me.introduce()).toBe('My name is John Doe, and I\'m currently unemployed.');
            me.name = 'Fei Liu';
            me.occupation = 'a web developer';
            expect(me.name).toBe('Fei Liu');
            expect(me.introduce()).toBe('My name is Fei Liu, and I\'m currently a web developer.');
        });
    });

    describe('depencency', function() {

        it('should work', function() {

            foo.define('fb', function(bar) {

                return {
                    name: 'fb',
                    hi: function() {
                        return bar.name + ' ' + this.name;
                    }
                };
            }, ['bar']);

            var dep = foo.require(['fb']);
            expect(dep.fb.name).toBe('fb');
            expect(dep.fb.hi()).toBe('bar fb');
        });
    });

    describe('alias', function() {

        it('should work', function() {

            var dep = foo.require(['bar as b']);
            expect(dep.b.name).toBe('bar');
            expect(dep.b.hi()).toBe('bar says i\'m bar');

        });
    });

});

describe('mutilple objects', function() {

    var foo, bar;
    beforeEach(function() {
        foo = {};
        bar = {};
        moduler.create(foo);
        moduler.create(bar);
        foo.define('module1', function() {
            return {
                name: 'module1',
                description: 'should belong to foo'
            };
        });
        bar.define('module2', function() {
            return {
                name: 'module2',
                description: 'should belong to bar'
            };
        });
    });

    it('should work', function() {
        var depFoo = foo.require(['module1', 'module2']);
        expect(depFoo.module2).not.toBeDefined();
        var depBar = bar.require(['module1', 'module2']);
        expect(depBar.module1).not.toBeDefined();
    });

});

describe('augment object with require', function() {

    var foo;
    var baseObject = {
        name: 'baseObject'
    };
    beforeEach(function() {
        foo = {};
        moduler.create(foo);
        foo.define('bar', function() {
            return {
                name: 'bar',
                description: 'should be added to base object',
                fn: function() {
                    return this.name + ' should match as well.';
                }
            };
        });
    });
    it('should augment baseObject', function() {
        foo.require(['bar'], {base: baseObject});
        expect(baseObject.name).toBe('baseObject');
        expect(baseObject.bar.name).toBe('bar');
        expect(baseObject.bar.description).toBe('should be added to base object');
        expect(baseObject.bar.fn()).toBe('bar should match as well.');
    });
});
