define(function(require) {
    var PM;
    var defaultPath = 'http://localhost:8888/js/modules/';
    var config = {
        path: {
            baseUrl: defaultPath
        }
    };
    describe('pathmanager: moduleName', function() {
        beforeEach(function() {
            PM = require('pathManager');
            p = new PM(config);
        });
        it('should work', function() {
            expect(p.moduleName('foo.bar.fb')).toBe('fb');
        });
    });
    describe('pathmanager: path', function() {
        var pm;
        beforeEach(function() {
            PM = require('pathManager');
            p = new PM(config);
        });
        it('should work', function() {
            expect(p.path('foo.bar.fb.bf')).toBe(defaultPath + 'foo/bar/fb/bf.js');
        });
    });

    describe('pathmanager: path', function() {
        var pm;
        var newPath = 'http://localhost:8888/js/venders/';
        beforeEach(function() {
            PM = require('pathManager');
            p = new PM({
                path: {
                    baseUrl: newPath
                }
            });
        });
        it('should work', function() {
            expect(p.path('foo.bar.fb.bf')).toBe(newPath + 'foo/bar/fb/bf.js');
        });
    });
});
