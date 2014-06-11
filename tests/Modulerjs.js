var fakeGlobal;
beforeEach(function() {
    fakeGlobal = {name: 'fake global'};
});
describe('api', function() {
    it('should have static create', function() {
        expect(Modulerjs.create).toBeDefined();
    });
    it('should have static export', function() {
        expect(Modulerjs.exports).toBeDefined();
    });
    it('should have static extend', function() {
        expect(Modulerjs.extend).toBeDefined();
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
        Modulerjs.exports(fakeGlobal, 'some.deep.name.space.should.work', obj);
        expect(fakeGlobal.some.deep.name.space.should.work.ok()).toBe('should work');
    });
    it('export to exist object', function() {
        fakeGlobal.anotherObj = {name: 'another obj'};
        expect(fakeGlobal.anotherObj.name).toBe('another obj');

        Modulerjs.exports(fakeGlobal.anotherObj, 'some.deep.name.space.should.work', obj);
        expect(fakeGlobal.anotherObj.some.deep.name.space.should.work.ok()).toBe('should work');

        Modulerjs.exports(fakeGlobal, 'anotherObj.some.deep.name.space.should.work', obj);
        expect(fakeGlobal.anotherObj.some.deep.name.space.should.work.ok()).toBe('should work');
    });
});

describe('static create function', function() {

    var foo;

    beforeEach(function() {
        foo = {bar: {}};
        Modulerjs.create(foo.bar);
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

describe('require LOCAL constructor', function() {
    var foo = {};
    var s = 'this is a person speaking';
    var rst, msg;
    beforeEach(function(done) {
        Modulerjs.create(foo);
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
        Modulerjs.create(foo);
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
describe('require REMOTE module without "ready" callback', function() {
    var foo = {};
    var rst;
    beforeEach(function(done) {
        Modulerjs.create(foo);
        foo.require(['greet'], function(greet) {
            rst = greet;
            done();
        });
    });
    it('should work', function() {
        expect(rst('works')).toBe('works.');
    });
});
describe('require REMOTE module without "ready" callback', function() {
    var foo = {};
    var rst, rst1;
    beforeEach(function(done) {
        Modulerjs.create(foo);
        foo.require(['greet'], function(greet) {
            return greet;
        }, function(greet) {
            this.constant.set('bar', 'constant bar');
            rst = this.constant.get('bar');
            rst1 = greet;
            done();
        });
    });
    it('"this" should point to "base" object', function() {
        expect(rst).toBe('constant bar');
        expect(rst1('works')).toBe('works.');
    });
});
