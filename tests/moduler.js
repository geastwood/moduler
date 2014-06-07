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
describe('constant of a module', function() {
    var foo;
    beforeEach(function() {
        foo = {};
        moduler.create(foo);
    });

    it('api', function() {
        foo.define('foo', function() {
            expect(this.constant.set).toBeDefined();
            expect(this.constant.get).toBeDefined();
            return {};
        });
    });
    it('constant can only be defined once', function() {
        foo.define('bar', function() {
            expect(this.constant.set('foo', 'foo is a constant')).toBe(true);
            expect(this.constant.set('foo', 'should not be able to set')).toBe(false);
            return {};
        });
    });
});

describe('require LOCAL constructor', function() {
    var foo = {};
    var s = 'this is a person speaking';
    var rst, msg;
    beforeEach(function(done) {
        moduler.create(foo);
        foo.define('greet', function() {
            return function(thing) { return thing; };
        });
        foo.define('Person', function(greet) {
            var Person = function() {};
            Person.prototype.breath = 'air';
            Person.prototype.speak = greet;
            return Person;
        }, ['greet']);
        foo.require(['Person'], function(P) { // return callback
            var p1 = new P();
            return p1;
        }, function(p1) { // ready callback
            rst = p1.breath;
            msg = p1.speak(s);
            done();
        });
    });

    it('should work', function() {
        expect(rst).toBe('air');
        expect(msg).toBe(s);
    });
});

describe('require REMOTE constructor', function() {
    var foo = {};
    var s = 'this is a person speaking';
    var rst, msg;
    beforeEach(function(done) {
        moduler.create(foo);
        foo.require(['Person'], function(P) { // return callback
            var p1 = new P();
            return p1;
        }, function(p1) { // ready callback
            rst = p1.breath;
            msg = p1.speak(s);
            done();
        });
    });
    it('should work', function() {
        expect(rst).toBe('air');
        expect(msg).toBe(s + '.');
    });
});
/*
xdescribe('mutilple objects', function() {

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

*/
