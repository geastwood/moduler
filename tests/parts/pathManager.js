define(function(require) {
    describe('pathmanager: moduleName', function() {
        var p;
        beforeEach(function() {
            p = require('pathManager');
        });
        it('should work', function() {
            expect(p.moduleName('foo.bar.fb')).toBe('fb');
        });
    });
    describe('pathmanager: path', function() {
        var p;
        var defaultPath = 'http://localhost:8888/js/modules/';
        beforeEach(function() {
            p = require('pathManager');
        });
        it('should work', function() {
            expect(p.path('foo.bar.fb.bf')).toBe(defaultPath + 'foo/bar/fb/bf.js');
        });
    });

    describe('pathmanager: path', function() {
        var p;
        var newPath = 'http://localhost:8888/js/venders/';
        beforeEach(function() {
            p = require('pathManager');
            p.config({
                baseUrl: newPath
            });
        });
        it('should work', function() {
            expect(p.path('foo.bar.fb.bf')).toBe(newPath + 'foo/bar/fb/bf.js');
        });
    });
});
