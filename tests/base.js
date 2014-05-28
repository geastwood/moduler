describe('base object when defining module', function() {

    var foo;

    beforeEach(function() {
        foo = {};
        moduler.create(foo);
    });

    it('should work', function() {
        foo.define('bar', function() {
            expect(this.inherit).toBeDefined();
            expect(this.each).toBeDefined();
            expect(this.mixin).toBeDefined();
            expect(this.constant.set).toBeDefined();
            this.constant.set('foo', 'foo is a constant');
            expect(this.constant.get('foo')).toBe('foo is a constant');
            return {
                name: 'bar',
                description: 'should be added to base object',
                fn: function() {
                    return this.name + ' should match as well.';
                }
            };
        });

    });
});
describe('base object\'s each method', function() {

    var foo;

    beforeEach(function() {
        foo = {};
        moduler.create(foo);
    });

    it('handle null', function() {
        foo.define('bar', function() {
            delete Array.prototype.forEach;
            var count = 0;
            this.each(null, function(v, i) {
                ++count;
            });
            expect(count).toBe(0);
        });
    });
    it('simple each for array', function() {
        foo.define('bar', function() {
            delete Array.prototype.forEach;
            var arr = [1, 2, 3, 4];
            var rst = [];
            this.each(arr, function(v, i) {
                rst[i] = v * 2;
            });
            expect(rst).toEqual([2, 4, 6, 8]);
        });
    });
    it('simple each with context for array', function() {
        foo.define('bar', function() {
            delete Array.prototype.forEach;
            var arr = [1, 2, 3, 4];
            var rst = [];
            this.each(arr, function(v, i) {
                rst[i] = v * this.factor;
            }, {factor: 3});
            expect(rst).toEqual([3, 6, 9, 12]);
        });
    });
    it('simple each with context for object', function() {
        foo.define('bar', function() {
            delete Array.prototype.forEach;
            var arr = {foo: 'f', bar: 'b', fb: 'bf'};
            var rst = {};
            rst.constructor.prototype.baz = 'baz';
            this.each(arr, function(v, i) {
                rst[i] = v + 'oo';
            });
            expect(rst).toEqual({foo: 'foo', bar: 'boo', fb: 'bfoo'});
        });
    });
});

describe('base object\'s inherit method', function() {

    var foo, People;
    beforeEach(function() {
        foo = {};
        moduler.create(foo);
        People = function() {};
        People.prototype.breath = 'air';
        People.prototype.talk = function(thing) {
            return thing;
        };
    });
    it('should work with existing Constructor function', function() {
        foo.define('bar', function() {
            var Developer = function() {};
            this.inherit(Developer, People);
            Developer.prototype.skill = 'programming';
            var dev = new Developer();
            expect(dev.skill).toBe('programming');
            expect(dev.breath).toBe('air');
            expect(dev.talk('this should work')).toBe('this should work');
        });
    });

    it('should work with empty constructor', function() {
        foo.define('bar', function() {
            var Developer = this.inherit(null, People);
            var ProductManager = this.inherit(null, People);
            var dev = new Developer();
            var pm = new ProductManager();
            expect(dev.breath).toBe('air');
            expect(pm.breath).toBe('air');
            expect(dev.talk('i\'m a developer')).toBe('i\'m a developer');
            expect(pm.talk('i\'m a product manager')).toBe('i\'m a product manager');
            Developer.prototype.skill = function() {
                return 'coding';
            };
            ProductManager.prototype.skill = function() {
                return 'planning';
            };
            expect(dev.skill()).toBe('coding');
            expect(pm.skill()).toBe('planning');
        });
    });

});

describe('base object\'s mixin method', function() {

    var foo, People;
    var obj1 = {
        foo: 'foo',
        bar: 'bar',
        fb: {
            bf: 'bf'
        }
    };
    beforeEach(function() {
        foo = {};
        moduler.create(foo);
        People = function() {};
        People.prototype.breath = 'air';
        People.prototype.talk = function(thing) {
            return thing;
        };
    });
    it('should work with shadow copy', function() {
        foo.define('bar', function() {
            var obj1 = {
                foo: 'foo',
                bar: 'bar',
                fb: {
                    bf: 'bf'
                }
            };
            var obj2 = this.mixin({}, obj1);
            obj1.fb.bf = 'changed';
            expect(obj2.fb.bf).toBe('changed');
            obj2.fb.bf = 'changed by obj2';
            expect(obj1.fb.bf).toBe('changed by obj2');
        });
    });
    it('should work with deep copy', function() {
        foo.define('bar', function() {
            var obj1 = {
                foo: 'foo',
                bar: 'bar',
                fb: {
                    bf: 'bf'
                }
            };
            var obj2 = this.mixin({}, obj1, false, true);
            obj1.fb.bf = 'changed';
            expect(obj2.fb.bf).toBe('bf');
            obj2.fb.bf = 'changed by obj2';
            expect(obj1.fb.bf).toBe('changed');
        });
    });
    it('should work with force flag', function() {
        foo.define('bar', function() {
            var obj1 = {
                foo: 'foo',
                bar: 'bar',
                fb: {
                    bf: 'bf'
                }
            };
            var obj2 = {
                foo: 'foo in obj2'
            };
            this.mixin(obj2, obj1, false);
            expect(obj2.foo).toBe('foo');
        });
    });

});

describe('base object\'s create method', function() {
    var foo, People;

    beforeEach(function() {
        foo = {};
        moduler.create(foo);
        People = function() {};
        People.prototype.breath = 'air';
        People.prototype.talk = function(thing) {
            return thing + '.';
        };
    });

    it('should work with simple extend', function() {

        foo.define('bar', function() {
            var peopleCreator = this.extendCtor(People);
            var template = {name: 'foo', age: 20, skills:['java', 'php']};
            var p1 = peopleCreator(template);
            expect(p1.breath).toBe('air');
            expect(p1.name).toBe('foo');
            expect(p1.age).toBe(20);
            template.skills[0] = 'javascript';
            expect(p1.skills[0]).toBe('javascript');
            expect(p1.talk('something')).toBe('something.');
        });
    });

    it('should work with deep extend', function() {

        foo.define('bar', function() {
            var peopleCreator = this.extendCtor(People);
            var template = {name: 'foo', age: 20, skills:['java', 'php']};
            var p1 = peopleCreator(template, true);
            expect(p1.breath).toBe('air');
            expect(p1.name).toBe('foo');
            expect(p1.age).toBe(20);
            template.skills[0] = 'javascript';
            expect(p1.skills[0]).toBe('java');
            expect(p1.talk('something')).toBe('something.');
        });
    });
});
