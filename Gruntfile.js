"use strict";

module.exports = function(grunt) {
    grunt.initConfig({
        jasmine: {
            dist: {
                src: ['dist/Modulerjs.js', 'extensions/*.js'],
                options: {
                    specs: ['tests/dist/*.js']
                }
            },
            pathManager: {
                src: ['src/pathManager.js'],
                options: {
                    specs: ['tests/parts/pathManager.js'],
                    template: require('grunt-template-jasmine-requirejs'),
                    templateOptions: {
                        requireConfig: {
                            baseUrl: 'src'
                        }
                    }
                }
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
