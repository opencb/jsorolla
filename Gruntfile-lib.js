module.exports = function (grunt) {

    grunt.initConfig({
        def:{
            name:'lib'
        },
        concat: {
            dist: {
                src: ['src/lib/**/*.js'],
                dest: 'build/<%= def.name %>/<%= def.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= def.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'build/<%= def.name %>/<%= def.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['concat', 'uglify']);

};

