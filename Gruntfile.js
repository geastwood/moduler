module.exports = function(grunt) {

    "use strict";

    grunt.initConfig({
        jasmine: {
            src: 'src/*.js',
            options: {
                specs: 'tests/*.js'
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

    grunt.registerTask('default', 'watch');
};
