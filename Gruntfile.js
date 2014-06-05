"use strict";

module.exports = function(grunt) {
    grunt.initConfig({
        jasmine: {
            src: ['dist/moduler.js', 'extensions/*.js'],
            options: {
                specs: ['tests/moduler.js',
                        'tests/extend_util.js',
                        'tests/base.js',
                        'tests/script_loader.js']
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
                    name: 'moduler',
                    out: 'dist/moduler.js',
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
                            globalModules: ['moduler']
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
    grunt.registerTask('test', ['build', 'exec', 'jasmine']);
    grunt.registerTask('build', ['requirejs:js']);
    grunt.registerTask('server', ['exec']);
    grunt.registerTask('default', ['exec', 'watch']);
};
