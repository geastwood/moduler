module.exports = function(grunt) {

    "use strict";

    grunt.initConfig({
        jasmine: {
            src: ['src/moduler.js', 'src/extend_util.js'],
            options: {
                specs: ['tests/moduler.js', 'tests/extend_util.js']
            }
        },
        watch: {
            scripts: {
                files: ['src/*.js', 'tests/*.js'],
                tasks: ['jasmine']
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('test', 'jasmine');
    grunt.registerTask('default', 'watch');
};
