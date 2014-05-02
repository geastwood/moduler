var fakeGlobal;
beforeEach(function() {
    fakeGlobal = {name: 'fake global'};
});

describe('exports', function() {
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

describe('create', function() {

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

});
