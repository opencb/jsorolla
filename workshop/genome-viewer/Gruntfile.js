/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        concat: {
            build: {
                src: [
                    'js/**/*.js'
                ],
                dest: 'build/app.js'
            }
        },
        uglify: {
            build: {
                src: '<%= concat.build.dest %>',
                dest: 'build/app.min.js'
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');


    // Default task.
    grunt.registerTask('default', ['concat', 'uglify']);

};
