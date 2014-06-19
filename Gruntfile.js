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
        coffee: {
            compile: {
                options: {
                    bare: true
                },
                files: {
                    'src/pathManager.js': 'src/coffee/pathManager.coffee',
                    'src/scriptLoader.js': 'src/coffee/scriptLoader.coffee',
                    'src/constant.js': 'src/coffee/constant.coffee',
                    'src/dependencyManager.js': 'src/coffee/dependencyManager.coffee',
                    'src/resolver.js': 'src/coffee/resolver.coffee',
                    'src/foundation.js': 'src/coffee/foundation.coffee'
                }
            }
        },
        watch: {
            scripts: {
                files: ['src/*.js',
                        'src/coffee/*.coffee',
                        'extensions/*.js',
                        'tests/dist/*.js',
                        'tests/parts/*.js'],
                tasks: ['coffee', 'build', 'jasmine']
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
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-exec');
    grunt.registerTask('build', ['requirejs:js']);
    grunt.registerTask('server', ['exec']);
    grunt.registerTask('test', ['build', 'server', 'jasmine']);
    grunt.registerTask('default', ['exec', 'watch']);
};
