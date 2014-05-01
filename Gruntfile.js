/*global module:false*/
module.exports = function (grunt) {

    grunt.initConfig({
        hub: {
            lib: {
                src: ['Gruntfile-lib.js'],
                tasks: ['default']
            }
        }
    })

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-hub');

    grunt.registerTask('default', ['hub:lib']);
};
