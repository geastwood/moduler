"use strict";

module.exports = function(grunt) {
    grunt.initConfig({
        jasmine: {
            src: ['dist/moduler.js', 'src/extend_util.js'],
            options: {
                specs: ['tests/moduler.js', 'tests/extend_util.js']
            }
        },
        watch: {
            scripts: {
                files: ['src/*.js', 'tests/*.js'],
                tasks: ['build', 'jasmine']
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            js: {
                options: {
                    mainConfigFile: 'build/config.js',
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
        }
    });
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('test', ['build', 'jasmine']);
    grunt.registerTask('build', ['requirejs:js']);
    grunt.registerTask('default', 'watch');
};
