"use strict";

module.exports = function(grunt) {
    grunt.initConfig({
        jasmine: {
            src: ['dist/Modulerjs.js', 'extensions/*.js'],
            options: {
                specs: ['tests/Modulerjs.js',
                        'tests/constant.js',
                        'tests/foundation.js',
                        'tests/extend_util.js',
                        'tests/base.js',
                        'tests/script_loader.js',
                        'tests/path_with_modules.js']
            }
        },
        watch: {
            scripts: {
                files: ['src/*.js',
                        'extensions/*.js',
                        'tests/*.js'],
                tasks: ['build', 'jasmine']
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            js: {
                options: {
                    baseUrl: 'src',
                    optimize: 'none',
                    name: 'Modulerjs',
                    out: 'dist/Modulerjs.js',
                    wrap: true,
                    onModuleBundleComplete: function (data) {
                        var fs = require('fs'),
                        amdclean = require('amdclean'),
                        outputFile = data.path;
                        fs.writeFileSync(outputFile, amdclean.clean({
                            'filePath': outputFile,
                            wrap: {
                                'start': ';(function() {\n',
                                'end': '\n}());'
                            },
                            globalModules: ['Modulerjs']
                        }));
                    }
                }
            }
        },
        exec: {
            startServer: {
                cmd: 'cd test-server/ && forever start server.js && cd .',
            }
        }

    });
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-exec');
    grunt.registerTask('build', ['requirejs:js']);
    grunt.registerTask('server', ['exec']);
    grunt.registerTask('test', ['build', 'server', 'jasmine']);
    grunt.registerTask('default', ['exec', 'watch']);
};
